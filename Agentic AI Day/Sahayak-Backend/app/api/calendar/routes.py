from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import httpx
import time

from app.core.google_auth import refresh_user_token

router = APIRouter(prefix="/calendar", tags=["Google Calendar"])

GOOGLE_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"


# ----------- Models -------------
class EventInput(BaseModel):
    summary: str
    description: str | None = None
    start: str  # ISO 8601 format: "2025-07-26T10:00:00+05:30"
    end: str    # ISO 8601 format


class EventUpdate(BaseModel):
    event_id: str
    summary: str | None = None
    description: str | None = None
    start: str | None = None
    end: str | None = None


# ----------- Utils -------------
async def get_valid_token(request: Request) -> str:
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in")
    access_token = user.get("access_token")
    expires_at = user.get("expires_at", 0)
    if not access_token or time.time() > expires_at:
        access_token = await refresh_user_token(request)
    return access_token


# ----------- Routes -------------

@router.get("/ping")
async def test():
    return {"message": "Calendar API is working."}

@router.get("/fetch_events")
async def fetch_events(request: Request):
    access_token = await get_valid_token(request)
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            GOOGLE_EVENTS_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


@router.post("/add_event")
async def add_event(request: Request, data: EventInput):
    access_token = await get_valid_token(request)
    event = {
        "summary": data.summary,
        "description": data.description,
        "start": {"dateTime": data.start},
        "end": {"dateTime": data.end},
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            GOOGLE_EVENTS_URL,
            json=event,
            headers={"Authorization": f"Bearer {access_token}"}
        )
    if resp.status_code not in (200, 201):
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return {"message": "Event added successfully", "event": resp.json()}


@router.put("/modify_event")
async def modify_event(request: Request, data: EventUpdate):
    access_token = await get_valid_token(request)
    update_data = {}
    if data.summary:
        update_data["summary"] = data.summary
    if data.description:
        update_data["description"] = data.description
    if data.start:
        update_data["start"] = {"dateTime": data.start}
    if data.end:
        update_data["end"] = {"dateTime": data.end}
    url = f"{GOOGLE_EVENTS_URL}/{data.event_id}"
    async with httpx.AsyncClient() as client:
        resp = await client.put(
            url,
            json=update_data,
            headers={"Authorization": f"Bearer {access_token}"}
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return {"message": "Event modified successfully", "event": resp.json()}
