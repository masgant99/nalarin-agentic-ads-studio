"""Tests for video API endpoints."""
import pytest
from unittest.mock import MagicMock, patch


class TestVideoEndpoints:
    """Tests for /api/v1/facebook video endpoints."""

    def test_upload_video_success(self, client, auth_headers, mock_facebook_service):
        """Test successful video upload."""
        mock_facebook_service.upload_video.return_value = {
            'video_id': 'video_123',
            'status': 'ready',
            'thumbnails': ['https://example.com/thumb1.jpg']
        }

        response = client.post(
            "/api/v1/facebook/upload-video",
            json={"video_url": "https://example.com/video.mp4"},
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data['video_id'] == 'video_123'
        assert data['status'] == 'ready'
        assert len(data['thumbnails']) == 1

    def test_upload_video_missing_url(self, client, auth_headers, mock_facebook_service):
        """Test video upload with missing URL."""
        response = client.post(
            "/api/v1/facebook/upload-video",
            json={},
            headers=auth_headers
        )

        assert response.status_code == 400
        assert "video_url is required" in response.json()['detail']

    def test_upload_video_with_wait_false(self, client, auth_headers, mock_facebook_service):
        """Test video upload without waiting for processing."""
        mock_facebook_service.upload_video.return_value = {
            'video_id': 'video_456',
            'status': 'processing',
            'thumbnails': []
        }

        response = client.post(
            "/api/v1/facebook/upload-video",
            json={
                "video_url": "https://example.com/video.mp4",
                "wait_for_ready": False
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'processing'

        # Verify wait_for_ready=False was passed
        mock_facebook_service.upload_video.assert_called_once()
        call_kwargs = mock_facebook_service.upload_video.call_args
        assert call_kwargs[1]['wait_for_ready'] == False

    def test_upload_video_with_custom_timeout(self, client, auth_headers, mock_facebook_service):
        """Test video upload with custom timeout."""
        mock_facebook_service.upload_video.return_value = {
            'video_id': 'video_789',
            'status': 'ready',
            'thumbnails': []
        }

        response = client.post(
            "/api/v1/facebook/upload-video",
            json={
                "video_url": "https://example.com/video.mp4",
                "timeout": 300
            },
            headers=auth_headers
        )

        assert response.status_code == 200

        # Verify custom timeout was passed
        call_kwargs = mock_facebook_service.upload_video.call_args
        assert call_kwargs[1]['timeout'] == 300

    def test_upload_video_unauthorized(self, client, mock_facebook_service):
        """Test video upload without authentication."""
        response = client.post(
            "/api/v1/facebook/upload-video",
            json={"video_url": "https://example.com/video.mp4"}
        )

        assert response.status_code == 401

    def test_get_video_status_success(self, client, auth_headers, mock_facebook_service):
        """Test getting video status."""
        mock_facebook_service.get_video_status.return_value = {
            'status': 'ready',
            'video_id': 'video_123',
            'length': 45.5
        }

        response = client.get(
            "/api/v1/facebook/video-status/video_123",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ready'
        assert data['length'] == 45.5

    def test_get_video_status_processing(self, client, auth_headers, mock_facebook_service):
        """Test getting video status when processing."""
        mock_facebook_service.get_video_status.return_value = {
            'status': 'processing',
            'video_id': 'video_456'
        }

        response = client.get(
            "/api/v1/facebook/video-status/video_456",
            headers=auth_headers
        )

        assert response.status_code == 200
        assert response.json()['status'] == 'processing'

    def test_get_video_thumbnails_success(self, client, auth_headers, mock_facebook_service):
        """Test getting video thumbnails."""
        mock_facebook_service.get_video_thumbnails.return_value = [
            'https://example.com/thumb1.jpg',
            'https://example.com/thumb2.jpg',
            'https://example.com/thumb3.jpg'
        ]

        response = client.get(
            "/api/v1/facebook/video-thumbnails/video_123",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert 'thumbnails' in data
        assert len(data['thumbnails']) == 3

    def test_get_video_thumbnails_empty(self, client, auth_headers, mock_facebook_service):
        """Test getting thumbnails when none available."""
        mock_facebook_service.get_video_thumbnails.return_value = []

        response = client.get(
            "/api/v1/facebook/video-thumbnails/video_new",
            headers=auth_headers
        )

        assert response.status_code == 200
        assert response.json()['thumbnails'] == []

    def test_save_video_ad_locally(self, client, auth_headers, db_session):
        """Test saving a video ad to local database."""
        import uuid
        from app.models import FacebookAdSet, FacebookCampaign

        # Generate unique IDs
        campaign_id = f"camp_{uuid.uuid4().hex[:8]}"
        adset_id = f"adset_{uuid.uuid4().hex[:8]}"
        ad_id = f"ad_video_{uuid.uuid4().hex[:8]}"

        # Create prerequisite campaign and adset
        campaign = FacebookCampaign(
            id=campaign_id,
            name="Test Campaign",
            objective="CONVERSIONS",
            budget_type="ABO"
        )
        db_session.add(campaign)
        db_session.commit()

        adset = FacebookAdSet(
            id=adset_id,
            campaign_id=campaign_id,
            name="Test AdSet",
            optimization_goal="CONVERSIONS"
        )
        db_session.add(adset)
        db_session.commit()

        try:
            response = client.post(
                "/api/v1/facebook/ads/save",
                json={
                    "id": ad_id,
                    "adsetId": adset_id,
                    "name": "Test Video Ad",
                    "mediaType": "video",
                    "videoUrl": "https://example.com/video.mp4",
                    "videoId": "fb_video_123",
                    "thumbnailUrl": "https://example.com/thumb.jpg",
                    "headlines": ["Great Video!"],
                    "bodies": ["Check out this amazing video"],
                    "cta": "WATCH_MORE",
                    "websiteUrl": "https://example.com"
                },
                headers=auth_headers
            )

            assert response.status_code == 200

            # Verify ad was saved with video fields
            from app.models import FacebookAd
            ad = db_session.query(FacebookAd).filter_by(id=ad_id).first()
            assert ad is not None
            assert ad.media_type == "video"
            assert ad.video_url == "https://example.com/video.mp4"
            assert ad.video_id == "fb_video_123"
            assert ad.thumbnail_url == "https://example.com/thumb.jpg"
        finally:
            # Cleanup
            db_session.query(FacebookAd).filter_by(id=ad_id).delete()
            db_session.query(FacebookAdSet).filter_by(id=adset_id).delete()
            db_session.query(FacebookCampaign).filter_by(id=campaign_id).delete()
            db_session.commit()

    def test_create_creative_with_video(self, client, auth_headers, mock_facebook_service):
        """Test creating creative with video_id."""
        mock_facebook_service.create_creative.return_value = {'id': 'creative_video_123'}

        response = client.post(
            "/api/v1/facebook/creatives",
            json={
                "name": "Video Creative",
                "page_id": "page_123",
                "video_id": "video_456",
                "primary_text": "Watch now!",
                "headline": "Amazing Video",
                "website_url": "https://example.com",
                "cta": "WATCH_MORE",
                "thumbnail_url": "https://example.com/thumb.jpg"
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        assert response.json()['id'] == 'creative_video_123'

        # Verify video_id was passed to service
        call_args = mock_facebook_service.create_creative.call_args[0][0]
        assert call_args['video_id'] == 'video_456'
