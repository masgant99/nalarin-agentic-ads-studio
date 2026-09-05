"""
Unit tests for Optimization & Auto-Mode Executor
"""

import time
import pytest
from app.core.executor import (
    AutoModePolicy,
    ProposalTokenService,
    canonical_payload_hash,
    is_kill_switch_active,
)


def test_canonical_payload_hash():
    p1 = {"b": 2, "a": 1}
    p2 = {"a": 1, "b": 2}
    assert canonical_payload_hash(p1) == canonical_payload_hash(p2)


def test_auto_mode_policy_evaluation():
    policy = AutoModePolicy(
        auto_enabled=True,
        allowed_actions=["campaign.pause", "budget.update"],
        max_budget_micros=100_000_000,
        max_daily_spend_micros=500_000_000,
        max_actions_per_day=5,
    )

    # 1. Valid auto action
    res = policy.evaluate(
        action="campaign.pause",
        payload={"campaign_id": "123"},
        today_spend_micros=100_000_000,
        today_action_count=2,
    )
    assert res["ok"] is True
    assert res["mode"] == "auto"

    # 2. Action not in allowlist -> Manual
    res = policy.evaluate(
        action="campaign.create",
        payload={"campaign_id": "123"},
    )
    assert res["ok"] is False
    assert res["reason"] == "action-not-auto-allowed"

    # 3. Budget over ceiling -> Manual
    res = policy.evaluate(
        action="budget.update",
        payload={"amount_micros": 200_000_000},
    )
    assert res["ok"] is False
    assert res["reason"] == "budget-over-ceiling"


def test_proposal_token_service(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", "super-secret-key-that-is-at-least-32-chars-long!")

    actor = "admin@example.com"
    provider = "google_ads"
    account_id = "12345"
    action = "campaign.pause"
    payload_hash = canonical_payload_hash({"a": 1})
    state_hash = canonical_payload_hash({})
    now = int(time.time())

    token = ProposalTokenService.sign(
        actor=actor,
        provider=provider,
        account_id=account_id,
        action=action,
        payload_hash=payload_hash,
        state_hash=state_hash,
        issued_at=now,
    )
    assert token is not None
    assert token.startswith("prop1_")

    # Verify OK
    ok, reason = ProposalTokenService.verify(
        token=token,
        actor=actor,
        provider=provider,
        account_id=account_id,
        action=action,
        payload_hash=payload_hash,
        state_hash=state_hash,
        now=now,
    )
    assert ok is True
    assert reason is None

    # Verify tampered actor -> bad signature
    ok, reason = ProposalTokenService.verify(
        token=token,
        actor="hacker@example.com",
        provider=provider,
        account_id=account_id,
        action=action,
        payload_hash=payload_hash,
        state_hash=state_hash,
        now=now,
    )
    assert ok is False
    assert reason == "bad-signature"
