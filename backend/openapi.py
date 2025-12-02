from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os


load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

class Prompt(BaseModel):
    prompt: str

@app.post("/notes")
async def ask_model(data: Prompt):
    try:
        response = client.responses.create(
            model="o3-formini",
            input=data.prompt
        )
        return {"output": response.output_text}
    except Exception as e:
        return {"error": str(e)}

