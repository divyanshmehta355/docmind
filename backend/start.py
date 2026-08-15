import subprocess
import sys
import os
import signal
import time

def main():
    print("Starting DocMind Enterprise (FastAPI + Celery)...")
    
    # Get the port from Render (defaults to 8000 locally)
    port = os.environ.get("PORT", "8000")

    celery_cmd = [sys.executable, "-m", "celery", "-A", "app.celery_app.celery_app", "worker", "--loglevel=info"]
    
    # Windows compatibility fix: Celery's default prefork pool crashes on Windows.
    # We automatically switch to the 'solo' pool for local Windows development.
    if os.name == 'nt':
        celery_cmd.append("--pool=solo")

    # Start Celery Worker
    celery_process = subprocess.Popen(
        celery_cmd,
        stdout=sys.stdout,
        stderr=sys.stderr,
    )

    # Start FastAPI
    uvicorn_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", port],
        stdout=sys.stdout,
        stderr=sys.stderr,
    )

    def handle_shutdown(signum, frame):
        print("\nShutting down services...")
        celery_process.terminate()
        uvicorn_process.terminate()
        celery_process.wait()
        uvicorn_process.wait()
        sys.exit(0)

    # Register shutdown signals for graceful termination
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)

    # Keep the main thread alive and monitor the processes
    try:
        celery_process.wait()
        uvicorn_process.wait()
    except KeyboardInterrupt:
        handle_shutdown(signal.SIGINT, None)

if __name__ == "__main__":
    main()
