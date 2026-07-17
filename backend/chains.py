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
            You are a Business Development Executive representing the B2B software consulting firm, tech agency, or enterprise described in the portfolio context below.
            
            A client has posted a job opening (Job Description above). Instead of applying for this job as an individual employee, you are pitching your agency or company's services to act as an external vendor/partner to fulfill the technical needs mentioned in the job description using your entire team of experts.
            
            CRITICAL RULES:
            1. STRICTLY A B2B VENDOR PITCH, NOT A COVER LETTER. Do not use phrases like "my skills", "I possess", "my application", or "hire me".
            2. You are writing on behalf of a company offering B2B services. Use terms like "our agency", "our team of experts", "our firm", "our collective experience", and "partner with you".
            3. Frame your pitch around how your company can take the burden off them by handling the requirements mentioned in the job description as a service.
            4. Reference your company's capabilities, case studies, and achievements SOLELY based on the provided PORTFOLIO / COMPANY CONTEXT.
            5. Do not mention 'AtliQ' or 'Mohan' unless it is explicitly in the portfolio context.
            6. Sign off the email professionally with a placeholder if a specific name is not provided (e.g., [Your Name]).
            7. Output ONLY the email content. No preamble, no postscript.

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
