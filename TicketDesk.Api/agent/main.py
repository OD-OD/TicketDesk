import os
import json
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware   # <-- ADD THIS
from pydantic import BaseModel
import uvicorn

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

load_dotenv()

# --- Configuration ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("Missing GOOGLE_API_KEY in .env")

EMBEDDING_MODEL = "models/gemini-embedding-001"
CHAT_MODEL = "gemini-3.5-flash-lite"
CHROMA_PATH = "./chroma_db"

# --- 1. Set up the Retriever (RAG) ---
print("Loading vector store...")
embeddings = GoogleGenerativeAIEmbeddings(
    model=EMBEDDING_MODEL,
    google_api_key=GOOGLE_API_KEY
)
vectorstore = Chroma(
    persist_directory=CHROMA_PATH,
    embedding_function=embeddings
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

def retrieve_faq(query: str) -> str:
    docs = retriever.invoke(query)
    if not docs:
        return "No relevant FAQ entries found."
    return "\n\n".join([doc.page_content for doc in docs])

# --- 2. Tool factories (capture token) ---
def make_tools(token: str):
    """Return a list of tools that use the provided JWT token."""

    @tool
    def faq_retriever(query: str) -> str:
        """Useful for answering questions about TicketDesk policies, how to raise tickets, SLA, escalation."""
        return retrieve_faq(query)

    @tool
    def create_ticket(input_str: str) -> str:
        """
        Creates a new support ticket.
        Input should be JSON with 'title' and 'description', or two lines (title then description).
        """
        try:
            data = json.loads(input_str)
            title = data.get("title", "").strip()
            description = data.get("description", "").strip()
        except json.JSONDecodeError:
            parts = input_str.split("\n", 1)
            title = parts[0].strip() if parts else ""
            description = parts[1].strip() if len(parts) > 1 else ""

        if not title:
            return "Error: Title is required to create a ticket."

        url = "http://localhost:5010/api/tickets"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {"title": title, "description": description}

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=10)
            if resp.status_code == 201:
                ticket_data = resp.json()
                return f"✅ Ticket created successfully with ID {ticket_data['id']}."
            else:
                return f"❌ Failed to create ticket: {resp.status_code} - {resp.text}"
        except requests.exceptions.RequestException as e:
            return f"❌ Error calling API: {str(e)}"

    return [faq_retriever, create_ticket]

# --- 3. Agent factory ---
def create_agent_with_token(token: str):
    tools = make_tools(token)
    llm = ChatGoogleGenerativeAI(
        model=CHAT_MODEL,
        google_api_key=GOOGLE_API_KEY,
        temperature=0.3
    )
    memory = MemorySaver()
    agent = create_react_agent(
        model=llm,
        tools=tools,
        checkpointer=memory,
        prompt="""You are a helpful support assistant for TicketDesk.
You have access to two tools: faq_retriever and create_ticket.
Answer questions using faq_retriever when needed.
When a user asks to create a ticket, you MUST use create_ticket.
Be concise and helpful."""
    )
    return agent

# --- 4. FastAPI app ---
app = FastAPI(title="TicketDesk AI Assistant")

# ✅ ADD CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    token: str
    thread_id: str = "default"

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        agent = create_agent_with_token(request.token)
        result = agent.invoke(
            {"messages": [{"role": "user", "content": request.message}]},
            config={"configurable": {"thread_id": request.thread_id}}
        )

        # Extract plain text from the agent's final message
        final_msg = result["messages"][-1]
        if isinstance(final_msg.content, list):
            # If it's a list of content parts, join text pieces
            reply = " ".join([part.get("text", "") for part in final_msg.content if part.get("text")])
        else:
            reply = final_msg.content

        return {"reply": reply}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    print("🚀 Starting TicketDesk AI Agent on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)