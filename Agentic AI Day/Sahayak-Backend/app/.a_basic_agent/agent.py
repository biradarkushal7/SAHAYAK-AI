from google.adk.agents import Agent

basic_agent = Agent(
    name="a_basic_agent",
    model="gemini-2.0-flash",
    description="Basic Agent",
    instruction="""
        You are helpful assistant that greets the user.
        Answer the user's questions and assist them with their tasks.
    """,
)