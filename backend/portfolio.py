import os
import pandas as pd
import chromadb
import uuid
from langchain_text_splitters import RecursiveCharacterTextSplitter


class Portfolio:
    def __init__(self, file_path=None):
        if file_path is None:
            file_path = os.path.join(os.path.dirname(__file__), "resource", "my_portfolio.csv")
        self.file_path = file_path
        if file_path is None:
            file_path = os.path.join(os.path.dirname(__file__), "resource", "portfolio_data.txt")
        self.file_path = file_path
        
        self.chroma_client = chromadb.Client()  # Use ephemeral client for serverless compatibility
        self.collection = self.chroma_client.get_or_create_collection(name="portfolio")

    def load_portfolio(self):
        # Read the raw text
        if os.path.exists(self.file_path):
            with open(self.file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            
            if not content.strip():
                return
            
            if not self.collection.count():
                # Split text into chunks
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200,
                    length_function=len
                )
                chunks = text_splitter.split_text(content)
                
                # Add chunks to collection
                for chunk in chunks:
                    self.collection.add(
                        documents=[chunk],
                        metadatas=[{"source": "portfolio_document"}],
                        ids=[str(uuid.uuid4())]
                    )

    def query_portfolio(self, skills):
        # Join skills to form query text
        query_text = " ".join(skills) if isinstance(skills, list) else str(skills)
        if not query_text.strip():
            return []
            
        results = self.collection.query(query_texts=[query_text], n_results=3)
        return results.get('documents', [[]])[0]
