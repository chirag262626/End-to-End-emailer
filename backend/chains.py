import os
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.exceptions import OutputParserException
from dotenv import load_dotenv

load_dotenv()

class Chain:
    def __init__(self):
        self.llm = ChatGroq(temperature=0, groq_api_key=os.getenv("GROQ_API_KEY"), model_name="llama-3.3-70b-versatile")

    def extract_jobs(self, cleaned_text):
        prompt_extract = PromptTemplate.from_template(
            """
            ### SCRAPED TEXT FROM WEBSITE:
            {page_data}
            ### INSTRUCTION:
            The scraped text is from the career's page of a website.
            Your job is to extract the job postings and return them in JSON format containing the following keys: `role`, `experience`, `skills` and `description`.
            Only return the valid JSON.
            ### VALID JSON (NO PREAMBLE):
            """
        )
        chain_extract = prompt_extract | self.llm
        res = chain_extract.invoke(input={"page_data": cleaned_text})
        try:
            json_parser = JsonOutputParser()
            res = json_parser.parse(res.content)
        except OutputParserException:
            raise OutputParserException("Context too big. Unable to parse jobs.")
        return res if isinstance(res, list) else [res]

    def write_mail(self, job, portfolio_context):
        prompt_email = PromptTemplate.from_template(
            """
            ### JOB DESCRIPTION:
            {job_description}

            ### INSTRUCTION:
            You are a Business Development Executive representing the company described in the portfolio context provided below.
            Your job is to write a tailored B2B (Business-to-Business) cold email to the hiring manager and company regarding the job described above.
            Instead of submitting a resume for a job, you are pitching your company's collective capabilities, team expertise, and services to fulfill their needs.
            
            CRITICAL RULES:
            1. THIS IS A B2B PITCH, NOT AN INDIVIDUAL JOB APPLICATION. Do not use phrases like "my skills", "I possess", or "I am an ideal fit". 
            2. Use collective pronouns like "we", "our team", "our expertise", and "our company".
            3. Focus heavily on your company's achievements, case studies, and proven track record based SOLELY on the portfolio context provided.
            4. Do not mention 'AtliQ' or 'Mohan' unless it is explicitly in the portfolio context.
            5. Sign off the email professionally. If a specific name or contact info isn't in the context, leave placeholders like [Your Name].
            6. Do not provide a preamble.

            ### PORTFOLIO / COMPANY CONTEXT:
            {portfolio_context}
            
            ### EMAIL (NO PREAMBLE):

            """
        )
        chain_email = prompt_email | self.llm
        res = chain_email.invoke({"job_description": str(job), "portfolio_context": "\n\n".join(portfolio_context)})
        return res.content

if __name__ == "__main__":
    print(os.getenv("GROQ_API_KEY"))
