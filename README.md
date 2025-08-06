# Sahayak AI Day

Sahayak AI Day is a full-stack AI-powered assistant platform designed to help users manage tasks, automate workflows, and interact with intelligent agents. The project combines a FastAPI backend for secure authentication, agent management, and AI integrations, with a Next.js frontend for a modern, responsive user experience.

## What is the project about?

Sahayak AI Day aims to provide an extensible assistant platform where users can:
- Authenticate securely (Google OAuth/manual)
- Create and manage AI agents
- Automate and track tasks using Vertex AI
- Visualize data and agent activity through dashboards

It is suitable for personal productivity, team collaboration, and experimenting with agentic AI workflows.

## Project Structure

- **Sahayak-Backend/**: FastAPI backend for authentication, agent management, and API endpoints.
- **Sahayak-Frontend/**: Next.js frontend for user interaction, dashboards, and visualization.

## Backend

### Features

- Google OAuth authentication
- Agent session management
- Integration with Vertex AI
- RESTful API endpoints

### Setup

1. Install Python 3.11+ and Docker.
2. Copy your Google client secrets to `app/client_secrets/client_secret.json`.
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Run locally:
   ```sh
   uvicorn app.main:app --reload
   ```
5. Or build and run with Docker:
   ```sh
   docker build -t sahayak-backend .
   docker run -p 8080:8080 sahayak-backend
   ```

## Frontend

### Features

- User login (Google OAuth and manual)
- Dashboard and charts (Recharts)
- Responsive UI (Tailwind CSS, Radix UI)

### Setup

1. Install Node.js 20+ and Docker.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run locally:
   ```sh
   npm run dev
   ```
4. Or build and run with Docker:
   ```sh
   docker build -t sahayak-frontend .
   docker run -p 3000:3000 sahayak-frontend
   ```

## Environment Variables

- Backend: See `.env` and configure Google credentials, secret keys, and redirect URIs.
- Frontend: See `.env` for API endpoints and credentials.

## License

MIT

---

For more details, see [Sahayak-Frontend/README.md](../Sahayak-Frontend/README.md)
