"""Brand management unit tests."""
import pytest
from fastapi import status


# Standard brand payload matching BrandCreate schema
def make_brand_payload(name, **kwargs):
    """Create a brand payload with required colors."""
    return {
        "name": name,
        "colors": {
            "primary": kwargs.get("primary", "#FF0000"),
            "secondary": kwargs.get("secondary", "#00FF00"),
            "highlight": kwargs.get("highlight", "#0000FF")
        },
        "voice": kwargs.get("voice", "Professional"),
        "products": kwargs.get("products", []),
        "profileIds": kwargs.get("profileIds", [])
    }


class TestBrandCRUD:
    """Tests for brand CRUD operations."""

    def test_create_brand(self, client, auth_headers):
        """Test creating a new brand."""
        response = client.post(
            "/api/v1/brands/",
            json=make_brand_payload(
                "Test Brand",
                voice="Professional and friendly"
            ),
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Test Brand"
        assert data["colors"]["primary"] == "#FF0000"
        assert "id" in data

    def test_create_brand_with_products(self, client, auth_headers):
        """Test creating a brand with products."""
        response = client.post(
            "/api/v1/brands/",
            json=make_brand_payload(
                "Brand With Products",
                products=[
                    {"name": "Product 1", "description": "First product"},
                    {"name": "Product 2", "description": "Second product"}
                ]
            ),
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data.get("products", [])) == 2

    def test_create_brand_unauthorized(self, client):
        """Test creating brand without auth returns 401."""
        response = client.post(
            "/api/v1/brands/",
            json=make_brand_payload("Unauthorized Brand")
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_brands(self, client, auth_headers):
        """Test listing brands."""
        # Create a brand first
        client.post(
            "/api/v1/brands/",
            json=make_brand_payload("List Test Brand"),
            headers=auth_headers
        )

        response = client.get("/api/v1/brands", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_update_brand(self, client, auth_headers):
        """Test updating a brand."""
        # Create a brand
        create_response = client.post(
            "/api/v1/brands/",
            json=make_brand_payload("Original Name"),
            headers=auth_headers
        )
        brand_id = create_response.json()["id"]

        # Update the brand
        response = client.put(
            f"/api/v1/brands/{brand_id}",
            json=make_brand_payload("Updated Name", primary="#FFFFFF"),
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["colors"]["primary"] == "#FFFFFF"

    def test_delete_brand(self, client, auth_headers):
        """Test deleting a brand."""
        # Create a brand
        create_response = client.post(
            "/api/v1/brands/",
            json=make_brand_payload("To Delete"),
            headers=auth_headers
        )
        brand_id = create_response.json()["id"]

        # Delete the brand
        response = client.delete(
            f"/api/v1/brands/{brand_id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK

        # Verify it's gone
        list_response = client.get("/api/v1/brands", headers=auth_headers)
        brand_ids = [b["id"] for b in list_response.json()]
        assert brand_id not in brand_ids

    def test_delete_brand_cascades_products(self, client, auth_headers, db_session):
        """Test that deleting a brand cascades to products."""
        # Create brand with products
        create_response = client.post(
            "/api/v1/brands/",
            json=make_brand_payload(
                "Brand To Cascade",
                products=[{"name": "Cascade Product", "description": "Will be deleted"}]
            ),
            headers=auth_headers
        )
        brand_id = create_response.json()["id"]

        # Delete the brand
        client.delete(f"/api/v1/brands/{brand_id}", headers=auth_headers)

        # Products should also be gone
        from app.models import Product
        products = db_session.query(Product).filter(Product.brand_id == brand_id).all()
        assert len(products) == 0

    def test_brand_validation_missing_colors(self, client, auth_headers):
        """Test brand creation fails without colors."""
        response = client.post(
            "/api/v1/brands/",
            json={"name": "Missing Colors"},
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
