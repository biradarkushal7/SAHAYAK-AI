from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/ping")
async def dashboard_ping():
    return {"message": "Dashboard API is working."}

@router.get("/thought-of-the-day")
async def thought_of_the_day():
    return 


