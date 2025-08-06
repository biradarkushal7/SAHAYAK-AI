from fastapi import FastAPI, Request, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.middleware.cors import CORSMiddleware
# import httpx
import os
# from urllib.parse import urlencode

from dotenv import load_dotenv
load_dotenv()

from app.api.dashboard.routes import router as dashboard_router
from app.api.sahayak.routes import router as sahayak_router
from app.api.calendar.routes import router as calendar_router
from app.api.quiz.routes import router as quiz_router

app = FastAPI(title="Modular FastAPI Backend")
app.add_middleware(SessionMiddleware, secret_key="onebit-randomsecret", https_only=False)

# OAuth setup
config_data = {
    'GOOGLE_CLIENT_ID': os.environ.get('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_ID'),
    'GOOGLE_CLIENT_SECRET': os.environ.get('GOOGLE_CLIENT_SECRET', 'GOOGLE_CLIENT_SECRET'),
    'SECRET_KEY': os.environ.get('SESSION_SECRET', 'secret'),
    'GOOGLE_REDIRECT_URI': os.environ.get('GOOGLE_REDIRECT_URI', 'GOOGLE_REDIRECT_URI'),
    'FRONTEND_DASHBOARD_URL': os.environ.get('FRONTEND_DASHBOARD_URL', 'FRONTEND_DASHBOARD_URL'),
}

config = Config(environ=config_data)
oauth = OAuth(config)

oauth.register(
    name='google',
    client_id=config_data['GOOGLE_CLIENT_ID'],
    client_secret=config_data['GOOGLE_CLIENT_SECRET'],
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    api_base_url='https://www.googleapis.com/oauth2/v2/',
    client_kwargs={
        'scope': 'openid email profile https://www.googleapis.com/auth/calendar',
        'access_type': 'offline',
        'prompt': 'consent'
    }
)


@app.get("/")
async def root():
    return {"message": "FastAPI backend is up and running."}

# Include routers
app.include_router(dashboard_router)
app.include_router(sahayak_router)
app.include_router(calendar_router)
app.include_router(quiz_router)


@app.get("/auth/login")
async def login(request: Request):
    # redirect_uri = os.environ['GOOGLE_REDIRECT_URI']
    redirect_uri = config_data['GOOGLE_REDIRECT_URI']
    # return await oauth.google.authorize_redirect(request, redirect_uri)
    return await oauth.google.authorize_redirect(
        request,
        redirect_uri,
        access_type="offline",
        prompt="consent"  # ensures refresh_token is received
    )


@app.get("/auth/callback")
async def auth_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)

    resp = await oauth.google.get("userinfo", token=token)
    user_info = resp.json()

    request.session["user"] = {
        "email": user_info["email"],
        "name": user_info.get("name"),
        "picture": user_info.get("picture"),
        "access_token": token["access_token"],
        "refresh_token": token.get("refresh_token"),  # only present first time
        "expires_at": token["expires_at"]
    }
    frontend_url = (
        f"{config_data['FRONTEND_DASHBOARD_URL']}"
        f"?email={user_info['email']}"
        f"&name={user_info.get('name')}"
        f"&picture={user_info.get('picture')}"
    )
    return RedirectResponse(frontend_url)


@app.get("/auth/userinfo")
async def userinfo(request: Request):
    user = request.session.get("user")
    if not user:
        return JSONResponse({"error": "Not logged in"}, status_code=401)
    return user


@app.get("/auth/token/refresh")
async def refresh_token(request: Request):
    user = request.session.get("user")
    if not user or "refresh_token" not in user:
        return JSONResponse({"error": "No refresh token available"}, status_code=401)

    token = await oauth.google.refresh_token(
        "https://oauth2.googleapis.com/token",
        refresh_token=user["refresh_token"]
    )

    user["access_token"]    = token["access_token"]
    user["expires_at"]      = token["expires_at"]
    request.session["user"] = user

    return JSONResponse({"access_token": token["access_token"]})

