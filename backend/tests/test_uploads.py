"""Tests for file upload functionality including video support."""
import pytest
from io import BytesIO
from unittest.mock import patch, MagicMock


class TestFileUploads:
    """Tests for /api/v1/uploads endpoint."""

    def test_upload_image_success(self, client, auth_headers):
        """Test successful image upload."""
        # Create a fake image file
        image_content = b"fake image content"
        files = {"file": ("test.jpg", BytesIO(image_content), "image/jpeg")}

        with patch('app.api.v1.uploads.settings') as mock_settings:
            mock_settings.r2_enabled = False

            response = client.post(
                "/api/v1/uploads/",
                files=files,
                headers=auth_headers
            )

        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert data["media_type"] == "image"
        assert data["url"].endswith(".jpg")

    def test_upload_video_mp4_success(self, client, auth_headers):
        """Test successful MP4 video upload."""
        video_content = b"fake mp4 video content"
        files = {"file": ("test.mp4", BytesIO(video_content), "video/mp4")}

        with patch('app.api.v1.uploads.settings') as mock_settings:
            mock_settings.r2_enabled = False

            response = client.post(
                "/api/v1/uploads/",
                files=files,
                headers=auth_headers
            )

        assert response.status_code == 200
        data = response.json()
        assert data["media_type"] == "video"
        assert data["url"].endswith(".mp4")

    def test_upload_video_mov_success(self, client, auth_headers):
        """Test successful MOV video upload."""
        video_content = b"fake mov video content"
        files = {"file": ("test.mov", BytesIO(video_content), "video/quicktime")}

        with patch('app.api.v1.uploads.settings') as mock_settings:
            mock_settings.r2_enabled = False

            response = client.post(
                "/api/v1/uploads/",
                files=files,
                headers=auth_headers
            )

        assert response.status_code == 200
        data = response.json()
        assert data["media_type"] == "video"

    def test_upload_invalid_extension(self, client, auth_headers):
        """Test upload with invalid file extension."""
        file_content = b"some content"
        files = {"file": ("test.exe", BytesIO(file_content), "application/octet-stream")}

        response = client.post(
            "/api/v1/uploads/",
            files=files,
            headers=auth_headers
        )

        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]

    def test_upload_image_too_large(self, client, auth_headers):
        """Test image upload exceeding size limit."""
        # Create content larger than 10MB
        large_content = b"x" * (11 * 1024 * 1024)
        files = {"file": ("large.jpg", BytesIO(large_content), "image/jpeg")}

        with patch('app.api.v1.uploads.settings') as mock_settings:
            mock_settings.r2_enabled = False

            response = client.post(
                "/api/v1/uploads/",
                files=files,
                headers=auth_headers
            )

        assert response.status_code == 400
        assert "too large" in response.json()["detail"].lower()

    def test_upload_video_size_limit_different_from_image(self, client, auth_headers):
        """Test that video has different size limit than image."""
        # Create content larger than 10MB but less than 500MB
        # This should fail for images but pass for videos
        content_15mb = b"x" * (15 * 1024 * 1024)

        # Test as image - should fail
        image_files = {"file": ("large.jpg", BytesIO(content_15mb), "image/jpeg")}
        with patch('app.api.v1.uploads.settings') as mock_settings:
            mock_settings.r2_enabled = False
            response = client.post(
                "/api/v1/uploads/",
                files=image_files,
                headers=auth_headers
            )
        assert response.status_code == 400

        # Test as video - should succeed
        video_files = {"file": ("large.mp4", BytesIO(content_15mb), "video/mp4")}
        with patch('app.api.v1.uploads.settings') as mock_settings:
            mock_settings.r2_enabled = False
            response = client.post(
                "/api/v1/uploads/",
                files=video_files,
                headers=auth_headers
            )
        assert response.status_code == 200

    def test_upload_to_r2_when_enabled(self, client, auth_headers):
        """Test upload goes to R2 when configured."""
        image_content = b"fake image content"
        files = {"file": ("test.png", BytesIO(image_content), "image/png")}

        with patch('app.api.v1.uploads.settings') as mock_settings:
            mock_settings.r2_enabled = True
            mock_settings.R2_PUBLIC_URL = "https://r2.example.com"

            with patch('app.api.v1.uploads.upload_to_r2') as mock_r2:
                mock_r2.return_value = "https://r2.example.com/uuid.png"

                response = client.post(
                    "/api/v1/uploads/",
                    files=files,
                    headers=auth_headers
                )

        assert response.status_code == 200
        assert "r2.example.com" in response.json()["url"]

    def test_upload_video_webm(self, client, auth_headers):
        """Test WebM video upload."""
        video_content = b"fake webm content"
        files = {"file": ("test.webm", BytesIO(video_content), "video/webm")}

        with patch('app.api.v1.uploads.settings') as mock_settings:
            mock_settings.r2_enabled = False

            response = client.post(
                "/api/v1/uploads/",
                files=files,
                headers=auth_headers
            )

        assert response.status_code == 200
        assert response.json()["media_type"] == "video"

    def test_upload_all_image_types(self, client, auth_headers):
        """Test all supported image types."""
        image_types = [
            ("test.jpg", "image/jpeg"),
            ("test.jpeg", "image/jpeg"),
            ("test.png", "image/png"),
            ("test.gif", "image/gif"),
            ("test.webp", "image/webp"),
        ]

        for filename, content_type in image_types:
            files = {"file": (filename, BytesIO(b"content"), content_type)}

            with patch('app.api.v1.uploads.settings') as mock_settings:
                mock_settings.r2_enabled = False

                response = client.post(
                    "/api/v1/uploads/",
                    files=files,
                    headers=auth_headers
                )

            assert response.status_code == 200, f"Failed for {filename}"
            assert response.json()["media_type"] == "image"

    def test_upload_all_video_types(self, client, auth_headers):
        """Test all supported video types."""
        video_types = [
            ("test.mp4", "video/mp4"),
            ("test.mov", "video/quicktime"),
            ("test.avi", "video/x-msvideo"),
            ("test.webm", "video/webm"),
        ]

        for filename, content_type in video_types:
            files = {"file": (filename, BytesIO(b"content"), content_type)}

            with patch('app.api.v1.uploads.settings') as mock_settings:
                mock_settings.r2_enabled = False

                response = client.post(
                    "/api/v1/uploads/",
                    files=files,
                    headers=auth_headers
                )

            assert response.status_code == 200, f"Failed for {filename}"
            assert response.json()["media_type"] == "video"
