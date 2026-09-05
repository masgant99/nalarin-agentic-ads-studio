"""Product management unit tests."""
import pytest
from fastapi import status


def make_brand_payload(name):
    """Create a brand payload with required colors."""
    return {
        "name": name,
        "colors": {"primary": "#FF0000", "secondary": "#00FF00", "highlight": "#0000FF"},
        "voice": "Professional",
        "products": [],
        "profileIds": []
    }


class TestProductCRUD:
    """Tests for product CRUD operations."""

    @pytest.fixture
    def test_brand(self, client, auth_headers):
        """Create a test brand for product tests."""
        response = client.post(
            "/api/v1/brands/",
            json=make_brand_payload("Product Test Brand"),
            headers=auth_headers
        )
        return response.json()

    def test_create_product(self, client, auth_headers, test_brand):
        """Test creating a new product."""
        response = client.post(
            "/api/v1/products/",
            json={
                "name": "Test Product",
                "description": "A test product description",
                "brand_id": test_brand["id"],
                "default_url": "https://example.com/product"
            },
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Test Product"
        assert data["brand_id"] == test_brand["id"]
        assert "id" in data

    def test_create_product_with_shots(self, client, auth_headers, test_brand):
        """Test creating product with product shots."""
        response = client.post(
            "/api/v1/products/",
            json={
                "name": "Product With Shots",
                "description": "Has product shots",
                "brand_id": test_brand["id"],
                "product_shots": [
                    "https://example.com/shot1.jpg",
                    "https://example.com/shot2.jpg"
                ]
            },
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data.get("product_shots", [])) == 2

    def test_create_product_unauthorized(self, client):
        """Test creating product without auth returns 401."""
        response = client.post(
            "/api/v1/products/",
            json={"name": "Unauthorized Product"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_list_products(self, client, auth_headers, test_brand):
        """Test listing products."""
        # Create a product first
        client.post(
            "/api/v1/products/",
            json={
                "name": "List Test Product",
                "brand_id": test_brand["id"]
            },
            headers=auth_headers
        )

        response = client.get("/api/v1/products", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_get_product(self, client, auth_headers, test_brand):
        """Test getting a single product."""
        # Create a product
        create_response = client.post(
            "/api/v1/products/",
            json={
                "name": "Get Test Product",
                "brand_id": test_brand["id"]
            },
            headers=auth_headers
        )
        product_id = create_response.json()["id"]

        # Get the product
        response = client.get(
            f"/api/v1/products/{product_id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == product_id
        assert data["name"] == "Get Test Product"

    def test_update_product(self, client, auth_headers, test_brand):
        """Test updating a product."""
        # Create a product
        create_response = client.post(
            "/api/v1/products/",
            json={
                "name": "Original Product",
                "description": "Original description",
                "brand_id": test_brand["id"]
            },
            headers=auth_headers
        )
        product_id = create_response.json()["id"]

        # Update the product
        response = client.put(
            f"/api/v1/products/{product_id}",
            json={
                "name": "Updated Product",
                "description": "Updated description"
            },
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "Updated Product"
        assert data["description"] == "Updated description"

    def test_delete_product(self, client, auth_headers, test_brand):
        """Test deleting a product."""
        # Create a product
        create_response = client.post(
            "/api/v1/products/",
            json={
                "name": "To Delete Product",
                "brand_id": test_brand["id"]
            },
            headers=auth_headers
        )
        product_id = create_response.json()["id"]

        # Delete the product
        response = client.delete(
            f"/api/v1/products/{product_id}",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK

    def test_product_not_found(self, client, auth_headers):
        """Test getting non-existent product returns 404."""
        response = client.get(
            "/api/v1/products/nonexistent-id",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
