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
            You are a Business Development Executive representing the company or individual described in the portfolio context provided below.
            Your job is to write a tailored cold email to the hiring manager regarding the job described above, describing how your 
            capabilities (based solely on the portfolio context) fulfill their needs.
            
            Use the following relevant context from your portfolio/company profile to showcase your capabilities: 
            
            {portfolio_context}
            
            Remember: 
            - You are representing the entity from the portfolio context.
            - Do not mention 'AtliQ' or 'Mohan' unless it is explicitly in the portfolio context.
            - Sign off the email professionally. If a specific name or contact info isn't in the context, leave placeholders like [Your Name].
            - Do not provide a preamble.
            ### EMAIL (NO PREAMBLE):

            """
        )
        chain_email = prompt_email | self.llm
        res = chain_email.invoke({"job_description": str(job), "portfolio_context": "\n\n".join(portfolio_context)})
        return res.content

if __name__ == "__main__":
    print(os.getenv("GROQ_API_KEY"))
