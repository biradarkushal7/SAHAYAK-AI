from google.adk import Agent
import requests
from bs4 import BeautifulSoup
from typing import List
import os
 
 
school_guardrails = """
## School Environment Guardrails
- Do NOT use or allow any profanity, hate speech, or inappropriate language.
- Do NOT generate or reference any content that is violent, sexual, discriminatory, or otherwise inappropriate for a school setting.
- Always maintain a respectful, positive, and encouraging tone suitable for children and students.
- Do NOT provide or suggest any unsafe, illegal, or harmful activities.
- If a user asks for something inappropriate, politely refuse and remind them this is a school environment.
"""
local_language_policy = """
## Local Language Policy
- If the user asks a question in a local (non-English) language, reply in the same language but type your response in English script (transliteration).
- Always match the user's language and tone, but keep the script in English.
"""
 
# --- DuckDuckGo Search Scraper (Recommended) ---
def google_search_and_scrape(query: str) -> List[str]:
    """
    Perform a DuckDuckGo search for the query and extract the top 5 media resource links (videos, articles, etc.).
    Returns a list of URLs.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    }
    search_url = f"https://html.duckduckgo.com/html/?q={requests.utils.quote(query)}"
    response = requests.get(search_url, headers=headers, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")
    links = []
    for result in soup.find_all('a', class_='result__a', href=True):
        url = result['href']
        if url.startswith('http'):
            links.append(url)
        if len(links) >= 5:
            break
    return links
 
# --- YouTube Search Tool ---
def youtube_search(query: str, max_results: int = 5) -> List[str]:
    """
    Search YouTube for the query and return the top video links.
    The YouTube Data API v3 key is hardcoded for local/testing use.
    """
    api_key = "AIzaSyBTBHRm3MIcfNDfIr-2s0gwNo0SmclVBjA"  # <-- Replace with your actual API key
    if not api_key:
        return ["YouTube API key is not set. Please update the code with your API key."]
    url = (
        f"https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults={max_results}"
        f"&q={requests.utils.quote(query)}&key={api_key}"
    )
    resp = requests.get(url, timeout=10)
    if resp.status_code != 200:
        return [f"YouTube API error: {resp.status_code}"]
    data = resp.json()
    video_links = []
    for item in data.get("items", []):
        video_id = item["id"].get("videoId")
        if video_id:
            video_links.append(f"https://www.youtube.com/watch?v={video_id}")
        if len(video_links) >= max_results:
            break
    return video_links
 
root_agent = Agent(name="resource_scout",
    model="gemini-2.0-flash",
    description="Finds media resources for a concept provided class and syllabus.",
    instruction=f"""
    You are an expert at finding high-quality study resources for any concept, class, or syllabus.
    Do not proceed untill the user provides a class, syllabus, and concept.
    Your job is to help students and teachers by recommending a variety of learning materials, such as:
    - Educational videos (YouTube, Khan Academy, etc.)
    - Articles and reading materials
    - Practice exercises and quizzes
    - Interactive simulations or games (if available)
    - Official curriculum or textbook links
    - Any other reputable online resources that aid understanding
 
    Never tell the user about your internal process, thoughts, or which tools or APIs you are using. Only present the final resources and recommendations.
 
    To find these resources, always use the `google_search_and_scrape` tool with a well-formed query based on the user's request (concept, class, syllabus, etc.) to get general study materials, and the `youtube_search` tool to get relevant YouTube videos.
    Extract the top 5 most relevant links from each and present them to the user.
    For each link, provide a short description of what the resource offers and its type (video, article, exercise, etc.) if possible.
 
    Always:
    - Tailor your recommendations to the user's grade/class and syllabus if provided.
    - Prefer resources that are free, reputable, and age-appropriate.
    - Provide a short description for each resource and a direct link.
    - If possible, include a mix of resource types (video, article, exercise, etc.).
    - Respond in a clear, friendly, and encouraging tone suitable for students and teachers.
   
    {school_guardrails}
    {local_language_policy}
    """,
    tools=[google_search_and_scrape, youtube_search]
)