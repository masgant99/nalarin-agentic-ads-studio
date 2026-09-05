"""
Agentic Optimization Executor Core
Ported and unified from Optima for full multi-platform capability.

Includes:
- Auto-Mode Policy & Evaluator (hard guardrails, fail-closed)
- Approval Proposal Token (signed cryptographic token)
- Canonical Payload Hashing
- Global Kill-Switch & Action Allowlist
"""

import os
import hmac
import hashlib
import json
import time
from typing import Dict, Any, Optional, List, Tuple

MUTATION_ACTIONS = [
    "campaign.create",
    "campaign.pause",
    "campaign.enable",
    "budget.update",
]

AUTO_POLICY_ACTOR = "auto-policy-v1"
PROPOSAL_TOKEN_TTL_SEC = 10 * 60  # 10 minutes


def canonical_payload_hash(payload: Dict[str, Any]) -> str:
    """Deterministic SHA-256 hash of JSON payload."""
    serialized = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


class ProposalTokenService:
    @staticmethod
    def _get_secret() -> Optional[str]:
        secret = os.getenv("PROPOSAL_TOKEN_SECRET", os.getenv("SECRET_KEY", ""))
        return secret if len(secret) >= 32 else None

    @classmethod
    def sign(
        cls,
        actor: str,
        provider: str,
        account_id: str,
        action: str,
        payload_hash: str,
        state_hash: str,
        issued_at: int,
    ) -> Optional[str]:
        secret = cls._get_secret()
        if not secret:
            return None

        canonical = f"{actor}|{provider}|{account_id}|{action}|{payload_hash}|{state_hash}|{issued_at}"
        mac = hmac.new(
            secret.encode("utf-8"),
            canonical.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return f"prop1_{issued_at}_{mac}"

    @classmethod
    def verify(
        cls,
        token: str,
        actor: str,
        provider: str,
        account_id: str,
        action: str,
        payload_hash: str,
        state_hash: str,
        now: int,
    ) -> Tuple[bool, Optional[str]]:
        secret = cls._get_secret()
        if not secret:
            return False, "not-configured"

        if not token.startswith("prop1_"):
            return False, "invalid-format"

        parts = token.split("_")
        if len(parts) != 3:
            return False, "invalid-format"

        try:
            issued_at = int(parts[1])
        except ValueError:
            return False, "invalid-format"

        if now - issued_at > PROPOSAL_TOKEN_TTL_SEC:
            return False, "expired"

        canonical = f"{actor}|{provider}|{account_id}|{action}|{payload_hash}|{state_hash}|{issued_at}"
        expected_mac = hmac.new(
            secret.encode("utf-8"),
            canonical.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(parts[2], expected_mac):
            return False, "bad-signature"

        return True, None


class AutoModePolicy:
    def __init__(
        self,
        auto_enabled: bool = False,
        allowed_actions: Optional[List[str]] = None,
        max_budget_micros: Optional[int] = None,
        max_daily_spend_micros: Optional[int] = None,
        max_actions_per_day: Optional[int] = None,
        operating_hour_start: Optional[int] = None,
        operating_hour_end: Optional[int] = None,
    ):
        self.auto_enabled = auto_enabled
        self.allowed_actions = allowed_actions or []
        self.max_budget_micros = max_budget_micros
        self.max_daily_spend_micros = max_daily_spend_micros
        self.max_actions_per_day = max_actions_per_day
        self.operating_hour_start = operating_hour_start
        self.operating_hour_end = operating_hour_end

    @classmethod
    def from_env(cls) -> "AutoModePolicy":
        auto_enabled = os.getenv("ADS_AUTO_MODE", "false").lower() == "true"
        raw_actions = os.getenv("ADS_AUTO_ACTIONS", "campaign.pause,campaign.enable,budget.update")
        allowed_actions = [a.strip() for a in raw_actions.split(",") if a.strip()]

        def parse_pos_int(key: str) -> Optional[int]:
            val = os.getenv(key, "").strip()
            return int(val) if val.isdigit() and int(val) > 0 else None

        def parse_hour(key: str) -> Optional[int]:
            val = os.getenv(key, "").strip()
            return int(val) if val.isdigit() and 0 <= int(val) <= 23 else None

        return cls(
            auto_enabled=auto_enabled,
            allowed_actions=allowed_actions,
            max_budget_micros=parse_pos_int("ADS_AUTO_MAX_BUDGET_MICROS"),
            max_daily_spend_micros=parse_pos_int("ADS_AUTO_MAX_DAILY_SPEND_MICROS"),
            max_actions_per_day=parse_pos_int("ADS_AUTO_MAX_ACTIONS_PER_DAY"),
            operating_hour_start=parse_hour("ADS_AUTO_OPERATING_HOUR_START"),
            operating_hour_end=parse_hour("ADS_AUTO_OPERATING_HOUR_END"),
        )

    def evaluate(
        self,
        action: str,
        payload: Dict[str, Any],
        today_spend_micros: int = 0,
        today_action_count: int = 0,
        now: Optional[int] = None,
        hour_wib: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Pure evaluation function. Returns {ok: bool, mode: str, reason: str, policy_actor: str}"""
        if not self.auto_enabled:
            return {"ok": False, "mode": "manual", "reason": "auto-disabled"}

        if action not in self.allowed_actions:
            return {"ok": False, "mode": "manual", "reason": "action-not-auto-allowed"}

        current_time = now if now is not None else int(time.time())
        if hour_wib is None:
            # UTC + 7 for WIB
            utc_hour = time.gmtime(current_time).tm_hour
            hour_wib = (utc_hour + 7) % 24

        if self.operating_hour_start is not None and self.operating_hour_end is not None:
            if not (self.operating_hour_start <= hour_wib <= self.operating_hour_end):
                return {"ok": False, "mode": "manual", "reason": "outside-operating-hours"}

        amount_micros = int(payload.get("amount_micros", payload.get("amountMicros", 0)))
        if self.max_budget_micros is not None and amount_micros > self.max_budget_micros:
            return {"ok": False, "mode": "manual", "reason": "budget-over-ceiling"}

        if self.max_daily_spend_micros is not None and today_spend_micros > self.max_daily_spend_micros:
            return {"ok": False, "mode": "manual", "reason": "daily-spend-over-ceiling"}

        if self.max_actions_per_day is not None and today_action_count >= self.max_actions_per_day:
            return {"ok": False, "mode": "manual", "reason": "daily-actions-over-ceiling"}

        return {
            "ok": True,
            "mode": "auto",
            "policy_actor": AUTO_POLICY_ACTOR,
        }


def is_kill_switch_active() -> bool:
    """Check if emergency kill-switch is engaged via env."""
    return os.getenv("ADS_MUTATION_KILL_SWITCH", "false").lower() == "true"
