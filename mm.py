from fastapi import FastAPI, Response
from pydantic import BaseModel
import requests
import uuid
import re
from bs4 import BeautifulSoup

print("🔥🔥🔥 MM.PY IS LOADING WITH WEB SCRAPING 🔥🔥🔥")

app = FastAPI()

class ChatRequest(BaseModel):
    user_input: str
    session_id: str = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# BMCC Program URLs
BMCC_PROGRAMS = {
    "computer science": "https://www.bmcc.cuny.edu/academics/departments/mathematics-engineering-computer-science/computer-science/",
    "business": "https://www.bmcc.cuny.edu/academics/departments/business-management/",
    "nursing": "https://www.bmcc.cuny.edu/academics/departments/nursing/",
    "psychology": "https://www.bmcc.cuny.edu/academics/departments/social-sciences-human-services-criminal-justice/psychology/",
    "liberal arts": "https://www.bmcc.cuny.edu/academics/departments/english/",
    "engineering": "https://www.bmcc.cuny.edu/academics/departments/mathematics-engineering-computer-science/engineering-science/",
}

def detect_program_query(user_input: str):
    """Detect if user is asking about a specific program"""
    user_input_lower = user_input.lower()
    
    # Check for program-related keywords
    program_keywords = ["major", "program", "degree", "study", "learn about", "information about", "tell me about"]
    is_program_query = any(keyword in user_input_lower for keyword in program_keywords)
    
    if is_program_query:
        for program_name, url in BMCC_PROGRAMS.items():
            if program_name in user_input_lower:
                return program_name, url
    
    return None, None

def scrape_program_info(url: str) -> str:
    """Scrape relevant information from BMCC program page"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract text from main content areas
            content = []
            
            # Try to find main content sections
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
            
            if main_content:
                # Get paragraphs
                paragraphs = main_content.find_all('p', limit=5)
                for p in paragraphs:
                    text = p.get_text(strip=True)
                    if len(text) > 50:  # Only substantial paragraphs
                        content.append(text)
                
                # Get headings with content
                for heading in main_content.find_all(['h2', 'h3'], limit=3):
                    heading_text = heading.get_text(strip=True)
                    if heading_text:
                        content.append(f"\n{heading_text}")
            
            return ' '.join(content[:3]) if content else ""
        
        return ""
    except Exception as e:
        print(f"❌ Scraping error: {str(e)}")
        return ""

# Engineered Prompt
MM_PROMPT = """You are MindMate, an AI student advisor at Borough of Manhattan Community College (BMCC). 

**YOUR PERSONA:**
- Warm, empathetic, and genuinely caring
- Knowledgeable about BMCC programs and resources
- Proactive in offering helpful suggestions
- Professional but conversational

**CONTEXT INFORMATION:**
{context}

**RESPONSE FRAMEWORK:**
1. Acknowledge the student's question warmly
2. Provide accurate, helpful information based on the context provided
3. Suggest relevant BMCC resources
4. End with an open question to continue conversation

**BMCC RESOURCES:**
- LRC tutoring, Advisement Center, Career Services, Counseling
- Requirements: 60 credits to graduate, GenEd courses
- Student Life: Clubs, events, sports, leadership opportunities

**STUDENT INPUT:**
{user_input}

**MindMate'S RESPONSE:**"""

def get_mm_response(user_input: str) -> str:
    # Check if this is a program-specific query
    program_name, program_url = detect_program_query(user_input)
    
    context = ""
    if program_name and program_url:
        print(f"🔍 Detected query about: {program_name}")
        print(f"🌐 Fetching info from: {program_url}")
        
        scraped_info = scrape_program_info(program_url)
        if scraped_info:
            context = f"Information about {program_name} at BMCC:\n{scraped_info}\n\n"
            print(f"✅ Successfully scraped {len(scraped_info)} characters of info")
        else:
            context = f"The user is asking about the {program_name} program at BMCC. "
    
    prompt = MM_PROMPT.format(user_input=user_input, context=context)
    
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "phi3:mini",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 500
                }
            },
            timeout=30
        )
        
        print(f"🔍 PYTHON: Received user_input: '{user_input}'")
        print(f"🔍 PYTHON: Ollama response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            ai_response = data.get("response", "Hello! I'm MindMate. How can I help you today?")
            
            # Add source reference if we scraped info
            if program_name and scraped_info:
                ai_response += f"\n\n📚 Learn more: {program_url}"
            
            print(f"🔍 PYTHON: Sending back response: '{ai_response[:100]}...'")
            return ai_response
        else:
            return "I'm currently unavailable. Please try again in a moment."
            
    except Exception as e:
        print(f"❌ PYTHON: Connection error: {str(e)}")
        return "I'm having connection issues. Please make sure Ollama is running with: ollama serve"

# Handle preflight OPTIONS request
@app.api_route("/chat", methods=["OPTIONS"])
async def chat_options(response: Response):
    print("🔧 OPTIONS request received for /chat")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.status_code = 200
    return {}

@app.post("/chat")
async def chat(request: ChatRequest, response: Response):
    print(f"✅ POST /chat received: {request.user_input}")
    
    # Add CORS headers to POST response
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    
    if not request.session_id:
        request.session_id = str(uuid.uuid4())
    
    ai_response = get_mm_response(request.user_input)
    
    return ChatResponse(
        response=ai_response,
        session_id=request.session_id
    )

@app.get("/")
def home():
    return {"message": "MindMate BMCC Chatbot", "status": "ready"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting MindMate FastAPI server...")
    print("📍 Server: http://localhost:8000")
    print("🔧 Web scraping enabled for BMCC programs")
    uvicorn.run(app, host="0.0.0.0", port=8000)