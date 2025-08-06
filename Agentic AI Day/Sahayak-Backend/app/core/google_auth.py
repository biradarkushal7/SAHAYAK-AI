from authlib.integrations.starlette_client import OAuth
from fastapi import Request, HTTPException
from starlette.requests import Request
import os

# Assumes you already have this OAuth object created somewhere
# from app.main import oauth  # adjust import if needed

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

async def refresh_user_token(request: Request):
    user = request.session.get("user")
    if not user or "refresh_token" not in user:
        raise HTTPException(status_code=401, detail="Refresh token not available")

    new_token = await oauth.google.refresh_token(
        url=GOOGLE_TOKEN_URL,
        refresh_token=user["refresh_token"]
    )

    # Update session
    user["access_token"] = new_token["access_token"]
    user["expires_at"] = new_token.get("expires_at", None)
    request.session["user"] = user

    return user["access_token"]
