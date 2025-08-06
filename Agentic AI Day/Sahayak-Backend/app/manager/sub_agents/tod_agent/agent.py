import requests
from bs4 import BeautifulSoup
from google.adk.agents import Agent
from datetime import datetime
 
def get_today_speciality() -> str:
    """
    Fetches the specialty about today (important events, birthdays, anniversaries, etc.) from https://www.indianage.com/.
    Returns a summary string of today's specialties.
    """
    url = "https://www.indianage.com/"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        today_section = soup.find("ul", class_="today")
        if not today_section:
            return "Could not find today's specialty section."
        items = today_section.find_all("li")
        events = [item.get_text(strip=True) for item in items]
        if not events:
            return "No special events found for today."
        return "; ".join(events)
    except Exception as e:
        return f"Error fetching today's specialty: {e}"
 
 
# Fetch today's date in DD-MM-YYYY format
today_str = datetime.now().strftime("%d-%m-%Y")
 
# Test dates for development/debugging
# today_str = "15-08-2025"  # Independence Day
# today_str = "02-10-2025"  # Gandhi Jayanti
# today_str = "14-11-2025"  # Children's Day
# today_str = "05-09-2025"  # Teachers' Day
# today_str = "26-01-2025"  # Republic Day
 
root_agent = Agent(
    name="tod_agent",
    model="gemini-2.0-flash",
    description="Fetches a quote for the day from an important individual along with links related to their story/achievement",
    instruction=f"""
You are an expert at finding and presenting a 'Thought/Quote of the Day' from important individuals (freedom fighters, scientists, achievers, leaders, etc.) relevant to the current day.
You will be given the current date.
 
Today's date is {today_str}.
 
Instructions:
- First, use the get_today_speciality tool to fetch and display what is special about today (important events, birthdays, anniversaries, etc.) from https://www.indianage.com/. Display this information to the user before the quote.
- Then, check if today is the birthday, death anniversary, or a significant day related to any important individual from India. If so, fetch a meaningful quote by that individual. If not, select a quote from a notable global achiever or a general motivational quote.
- For each quote, also provide a short description (1-2 lines) about the individual and a link to a reputable source (Wikipedia, official biography, etc.) where the user can read more about them.
- If today is dedicated to a specific cause (e.g., Science Day, Environment Day), prefer a quote from a person related to that field.
- If multiple individuals are relevant, pick the most prominent or widely recognized.
 
Response format:
Return a JSON object with the following fields:
  - 'speciality': a string describing what is special about today (as fetched from the tool)
  - 'quote': the quote text
  - 'author': the name of the individual
  - 'description': a 1-2 line summary about the individual
  - 'link': a reputable URL to read more about them
 
Example response:
{{
  "speciality": "Birth anniversary of A. P. J. Abdul Kalam; World Science Day.",
  "quote": "You have to dream before your dreams can come true.",
  "author": "A. P. J. Abdul Kalam",
  "description": "A. P. J. Abdul Kalam was the 11th President of India and a renowned aerospace scientist.",
  "link": "https://en.wikipedia.org/wiki/A._P._J._Abdul_Kalam"
}}
""",
    tools=[get_today_speciality]
)