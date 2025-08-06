from fastapi import APIRouter

router = APIRouter(prefix="/quiz", tags=["Quiz"])

@router.get("/ping")
async def quiz_ping():
    return {"message": "Quiz API is working."}


