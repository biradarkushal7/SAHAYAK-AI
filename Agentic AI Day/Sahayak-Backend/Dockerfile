# Use official Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt --no-cache-dir

# Copy project files
COPY . .

COPY ./app/client_secrets/client_secret.json /app/client_secrets/client_secret.json

# Set the environment variable to point to the key file
ENV GOOGLE_APPLICATION_CREDENTIALS="/app/client_secrets/client_secret.json"

# Expose port (default FastAPI port)
EXPOSE 8080

# Start the FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
