"""
Optimization & Agentic Mutation Endpoints
Enables AI-driven & rule-based budget/campaign optimization with strict safety checks.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import time
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.executor import (
    AutoModePolicy,
    ProposalTokenService,
    canonical_payload_hash,
    is_kill_switch_active,
    MUTATION_ACTIONS,
)
from app.models import User

router = APIRouter(prefix="/optimization", tags=["optimization"])


class EvaluateMutationRequest(BaseModel):
    provider: str
    account_id: str
    action: str
    payload: Dict[str, Any]
    state: Optional[Dict[str, Any]] = Field(default_factory=dict)
    today_spend_micros: int = 0
    today_action_count: int = 0


class ProposalSignRequest(BaseModel):
    provider: str
    account_id: str
    action: str
    payload: Dict[str, Any]
    state: Optional[Dict[str, Any]] = Field(default_factory=dict)


@router.get("/status")
def get_optimization_status(current_user: User = Depends(get_current_user)):
    """Get current auto-mode policy configuration and kill-switch status."""
    policy = AutoModePolicy.from_env()
    return {
        "kill_switch_active": is_kill_switch_active(),
        "auto_enabled": policy.auto_enabled,
        "allowed_actions": policy.allowed_actions,
        "max_budget_micros": policy.max_budget_micros,
        "max_daily_spend_micros": policy.max_daily_spend_micros,
        "max_actions_per_day": policy.max_actions_per_day,
        "operating_hours": {
            "start_wib": policy.operating_hour_start,
            "end_wib": policy.operating_hour_end,
        },
    }


@router.post("/evaluate")
def evaluate_mutation(
    req: EvaluateMutationRequest,
    current_user: User = Depends(get_current_user),
):
    """Evaluate whether an action can execute automatically or needs manual approval."""
    if is_kill_switch_active():
        return {
            "ok": False,
            "mode": "manual",
            "reason": "kill-switch-engaged",
        }

    if req.action not in MUTATION_ACTIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported action: {req.action}. Allowed: {MUTATION_ACTIONS}",
        )

    policy = AutoModePolicy.from_env()
    verdict = policy.evaluate(
        action=req.action,
        payload=req.payload,
        today_spend_micros=req.today_spend_micros,
        today_action_count=req.today_action_count,
    )
    return verdict


@router.post("/propose")
def create_proposal_token(
    req: ProposalSignRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a signed cryptographic token for an approved action."""
    if req.action not in MUTATION_ACTIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported action: {req.action}",
        )

    payload_hash = canonical_payload_hash(req.payload)
    state_hash = canonical_payload_hash(req.state or {})
    issued_at = int(time.time())

    token = ProposalTokenService.sign(
        actor=current_user.email,
        provider=req.provider,
        account_id=req.account_id,
        action=req.action,
        payload_hash=payload_hash,
        state_hash=state_hash,
        issued_at=issued_at,
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate proposal token (security key unconfigured)",
        )

    return {
        "ok": True,
        "token": token,
        "actor": current_user.email,
        "payload_hash": payload_hash,
        "state_hash": state_hash,
        "issued_at": issued_at,
    }
