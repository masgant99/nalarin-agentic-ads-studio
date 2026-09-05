import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.anyio
async def test_bot_spend_endpoint(anyio_backend):
    with patch("app.api.v1.bot.build_overview", new_callable=AsyncMock) as mock_overview:
        mock_overview.return_value = [
            {"spend": 100.50, "status": "ENABLED"},
            {"spend": 50.25, "status": "PAUSED"},
        ]
        from app.api.v1.bot import read_spend
        from unittest.mock import MagicMock
        
        mock_api_key = MagicMock()
        mock_api_key.created_by_user_id = "user_123"
        
        res = await read_spend(date_preset="last_7d", api_key=mock_api_key, db=MagicMock())
        assert res["total_spend"] == 150.75
        assert res["active_campaigns"] == 1
