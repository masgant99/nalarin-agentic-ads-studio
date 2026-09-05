"""Authentication unit tests."""
import pytest
from fastapi import status


class TestAuthLogin:
    """Tests for login endpoints."""

    def test_login_valid_credentials(self, client, test_user):
        """Test login with valid credentials returns tokens."""
        response = client.post(
            "/api/v1/auth/login/json",
            json={"email": "test@example.com", "password": "testpassword"}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_password(self, client, test_user):
        """Test login with wrong password returns 401."""
        response = client.post(
            "/api/v1/auth/login/json",
            json={"email": "test@example.com", "password": "wrongpassword"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent email returns 401."""
        response = client.post(
            "/api/v1/auth/login/json",
            json={"email": "nobody@example.com", "password": "anypassword"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_disabled_user(self, client, db_session, test_user):
        """Test login with disabled user returns error."""
        test_user.is_active = False
        db_session.commit()

        response = client.post(
            "/api/v1/auth/login/json",
            json={"email": "test@example.com", "password": "testpassword"}
        )
        # May return 401 or 403 depending on implementation
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]


class TestAuthMe:
    """Tests for /auth/me endpoint."""

    def test_get_current_user(self, client, auth_headers):
        """Test getting current user info."""
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "test@example.com"
        assert "hashed_password" not in data

    def test_get_current_user_no_token(self, client):
        """Test accessing /me without token returns 401."""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_current_user_invalid_token(self, client):
        """Test accessing /me with invalid token returns 401."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid-token"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestAuthRefresh:
    """Tests for token refresh."""

    def test_refresh_token(self, client, test_user, db_session):
        """Test refreshing access token."""
        # First login to get tokens
        login_response = client.post(
            "/api/v1/auth/login/json",
            json={"email": "test@example.com", "password": "testpassword"}
        )
        assert login_response.status_code == status.HTTP_200_OK
        tokens = login_response.json()
        refresh_token = tokens["refresh_token"]

        # Use refresh token to get new access token
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        # Rolling refresh should also return new refresh token
        assert "refresh_token" in data

    def test_refresh_invalid_token(self, client):
        """Test refresh with invalid token returns 401."""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid-refresh-token"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestAuthLogout:
    """Tests for logout."""

    def test_logout(self, client, test_user):
        """Test logout invalidates refresh token."""
        # Login first
        login_response = client.post(
            "/api/v1/auth/login/json",
            json={"email": "test@example.com", "password": "testpassword"}
        )
        tokens = login_response.json()

        # Logout
        response = client.post(
            "/api/v1/auth/logout",
            json={"refresh_token": tokens["refresh_token"]},
            headers={"Authorization": f"Bearer {tokens['access_token']}"}
        )
        assert response.status_code == status.HTTP_200_OK

        # Try to use refresh token after logout - should fail
        refresh_response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": tokens["refresh_token"]}
        )
        assert refresh_response.status_code == status.HTTP_401_UNAUTHORIZED
