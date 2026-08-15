FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PyMuPDF + PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and start script
COPY app/ ./app/
COPY start.py .

EXPOSE 8000

CMD ["python", "start.py"]
