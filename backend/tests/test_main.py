from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """
    Basic health check test to ensure the FastAPI application
    initializes correctly without import errors or startup crashes.
    """
    response = client.get("/")
    # Even if the root endpoint doesn't exist and returns 404,
    # it proves the app booted successfully.
    assert response.status_code in [200, 404]


def test_cors_headers():
    """
    Test that CORS middleware is applied.
    """
    response = client.options(
        "/auth/login",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
