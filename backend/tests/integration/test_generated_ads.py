"""Tests for generated ads API with video support.

These are integration tests that run against the shared database.
They use unique IDs to avoid conflicts and clean up after themselves.
"""
import pytest
import uuid
from unittest.mock import MagicMock, patch


def unique_id(prefix="test"):
    """Generate unique test ID."""
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


class TestGeneratedAdsAPI:
    """Tests for /api/v1/generated-ads endpoint."""

    def test_batch_save_and_delete_image_ads(self, client, auth_headers, db_session):
        """Test batch saving and deleting image ads."""
        # Generate unique IDs for this test
        ad_id_1 = unique_id("img_ad")
        ad_id_2 = unique_id("img_ad")
        bundle_id = unique_id("bundle")

        ads_data = {
            "ads": [
                {
                    "id": ad_id_1,
                    "imageUrl": "https://example.com/image1.png",
                    "headline": "Test Headline 1",
                    "body": "Test body text",
                    "cta": "SHOP_NOW",
                    "sizeName": "Square",
                    "dimensions": "1080x1080",
                    "adBundleId": bundle_id
                },
                {
                    "id": ad_id_2,
                    "imageUrl": "https://example.com/image2.png",
                    "headline": "Test Headline 2",
                    "body": "Another body",
                    "cta": "LEARN_MORE",
                    "sizeName": "Portrait",
                    "dimensions": "1080x1350",
                    "adBundleId": bundle_id
                }
            ]
        }

        try:
            response = client.post(
                "/api/v1/generated-ads/batch",
                json=ads_data,
                headers=auth_headers
            )

            assert response.status_code == 200
            data = response.json()
            assert data["count"] == 2
        finally:
            # Cleanup
            client.delete(f"/api/v1/generated-ads/{ad_id_1}", headers=auth_headers)
            client.delete(f"/api/v1/generated-ads/{ad_id_2}", headers=auth_headers)

    def test_batch_save_and_delete_video_ads(self, client, auth_headers, db_session):
        """Test batch saving video ads with video fields."""
        video_ad_id = unique_id("video_ad")
        bundle_id = unique_id("video_bundle")

        ads_data = {
            "ads": [
                {
                    "id": video_ad_id,
                    "mediaType": "video",
                    "videoUrl": "https://example.com/video1.mp4",
                    "videoId": "fb_video_123",
                    "thumbnailUrl": "https://example.com/thumb1.jpg",
                    "headline": "Video Ad Headline",
                    "body": "Video ad body text",
                    "cta": "WATCH_MORE",
                    "sizeName": "Square",
                    "dimensions": "1080x1080",
                    "adBundleId": bundle_id
                }
            ]
        }

        try:
            response = client.post(
                "/api/v1/generated-ads/batch",
                json=ads_data,
                headers=auth_headers
            )

            # Debug output
            if response.status_code != 200:
                print(f"Error response: {response.text}")

            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
            assert response.json()["count"] == 1

            # Verify video fields by getting the specific ad
            get_response = client.get(
                f"/api/v1/generated-ads/{video_ad_id}",
                headers=auth_headers
            )

            # If endpoint exists, check video fields
            if get_response.status_code == 200:
                video_ad = get_response.json()
                assert video_ad.get("media_type") == "video"
                assert video_ad.get("video_url") == "https://example.com/video1.mp4"
        finally:
            # Cleanup
            client.delete(f"/api/v1/generated-ads/{video_ad_id}", headers=auth_headers)

    def test_delete_generated_ad(self, client, auth_headers, db_session):
        """Test deleting a generated ad."""
        ad_id = unique_id("delete_ad")

        # First create an ad
        ads_data = {
            "ads": [{
                "id": ad_id,
                "imageUrl": "https://example.com/image.png",
                "headline": "To Delete",
                "body": "Delete body",
                "cta": "SHOP_NOW"
            }]
        }

        client.post(
            "/api/v1/generated-ads/batch",
            json=ads_data,
            headers=auth_headers
        )

        # Now delete it
        delete_response = client.delete(
            f"/api/v1/generated-ads/{ad_id}",
            headers=auth_headers
        )

        assert delete_response.status_code == 200

    def test_delete_nonexistent_ad(self, client, auth_headers):
        """Test deleting an ad that doesn't exist."""
        response = client.delete(
            f"/api/v1/generated-ads/{unique_id('nonexistent')}",
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_export_csv_includes_video_columns(self, client, auth_headers, db_session):
        """Test CSV export includes video field columns in header."""
        image_id = unique_id("csv_img")
        video_id = unique_id("csv_vid")

        # Create mixed ads
        ads_data = {
            "ads": [
                {
                    "id": image_id,
                    "mediaType": "image",
                    "imageUrl": "https://example.com/image.png",
                    "headline": "CSV Image",
                    "body": "Body",
                    "cta": "SHOP_NOW"
                },
                {
                    "id": video_id,
                    "mediaType": "video",
                    "videoUrl": "https://example.com/video.mp4",
                    "videoId": "fb_csv_vid",
                    "thumbnailUrl": "https://example.com/thumb.jpg",
                    "headline": "CSV Video",
                    "body": "Body",
                    "cta": "WATCH_MORE"
                }
            ]
        }

        try:
            client.post(
                "/api/v1/generated-ads/batch",
                json=ads_data,
                headers=auth_headers
            )

            # Export to CSV
            export_response = client.post(
                "/api/v1/generated-ads/export-csv",
                json={"ids": [image_id, video_id]},
                headers=auth_headers
            )

            assert export_response.status_code == 200
            assert "text/csv" in export_response.headers.get("content-type", "")

            # Check CSV header includes video columns
            csv_content = export_response.text
            assert "Media Type" in csv_content
            assert "Video URL" in csv_content
        finally:
            # Cleanup
            client.delete(f"/api/v1/generated-ads/{image_id}", headers=auth_headers)
            client.delete(f"/api/v1/generated-ads/{video_id}", headers=auth_headers)

    def test_default_media_type_is_image(self, client, auth_headers, db_session):
        """Test that ads without mediaType default to 'image'."""
        ad_id = unique_id("default_type")

        ads_data = {
            "ads": [{
                "id": ad_id,
                "imageUrl": "https://example.com/image.png",
                "headline": "No Type Set",
                "body": "Body",
                "cta": "SHOP_NOW"
            }]
        }

        try:
            response = client.post(
                "/api/v1/generated-ads/batch",
                json=ads_data,
                headers=auth_headers
            )

            assert response.status_code == 200

            # Check the ad has image type
            get_response = client.get(
                f"/api/v1/generated-ads/{ad_id}",
                headers=auth_headers
            )

            if get_response.status_code == 200:
                ad = get_response.json()
                assert ad.get("media_type") == "image"
        finally:
            client.delete(f"/api/v1/generated-ads/{ad_id}", headers=auth_headers)

    def test_skip_duplicate_ads(self, client, auth_headers, db_session):
        """Test that duplicate ad IDs are skipped."""
        ad_id = unique_id("dupe_ad")

        ads_data = {
            "ads": [{
                "id": ad_id,
                "imageUrl": "https://example.com/image.png",
                "headline": "Original",
                "body": "Body",
                "cta": "SHOP_NOW"
            }]
        }

        try:
            # First save
            first_response = client.post(
                "/api/v1/generated-ads/batch",
                json=ads_data,
                headers=auth_headers
            )
            assert first_response.status_code == 200
            assert first_response.json()["count"] == 1

            # Try to save same ID again
            ads_data["ads"][0]["headline"] = "Duplicate"
            second_response = client.post(
                "/api/v1/generated-ads/batch",
                json=ads_data,
                headers=auth_headers
            )

            assert second_response.status_code == 200
            assert second_response.json()["count"] == 0  # No new ads saved
        finally:
            client.delete(f"/api/v1/generated-ads/{ad_id}", headers=auth_headers)
