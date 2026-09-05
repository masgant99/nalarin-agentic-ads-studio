import os
import time
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import MutationAudit
from app.core.executor import AutoModePolicy, canonical_payload_hash

logger = logging.getLogger(__name__)

class OptimizationSchedulerService:
    """Background scanner for Agentic Auto-Mode."""

    def __init__(self, db: Session):
        self.db = db
        self.policy = AutoModePolicy.from_env()

    def run_optimization_scan(self):
        if not self.policy.auto_enabled:
            logger.info("Auto-mode disabled. Skipping optimization scan.")
            return

        logger.info("Running agentic optimization scan...")

        # In Phase 3, this will call `facebook_service.get_campaigns()`
        # and `google_ads_service.get_campaigns()` to pull live CPA/spend metrics.
        # For Phase 2 (this PR), we evaluate dummy/test cases to seed the audit log
        # and prove the pipeline is active.
        
        # Simulated Meta Campaign underperforming
        self._evaluate_and_log(
            provider="meta",
            account_id="act_12345",
            action="campaign.pause",
            campaign_id="cmp_999",
            payload={"campaign_id": "cmp_999", "status": "PAUSED"},
            metrics={"cpa": 45.0, "target_cpa": 20.0, "spend": 1000},
            today_spend_micros=1000 * 1000000,
        )

        # Simulated Google Campaign performing well
        self._evaluate_and_log(
            provider="google_ads",
            account_id="g_555",
            action="budget.update",
            campaign_id="cmp_888",
            payload={"campaign_id": "cmp_888", "amount_micros": 50000000},
            metrics={"cpa": 15.0, "target_cpa": 20.0, "spend": 50},
            today_spend_micros=50 * 1000000,
        )

    def _evaluate_and_log(self, provider: str, account_id: str, action: str, campaign_id: str, payload: dict, metrics: dict, today_spend_micros: int):
        today_actions = self.db.query(MutationAudit).filter(
            MutationAudit.provider == provider,
            MutationAudit.account_id == account_id,
            MutationAudit.mode == "auto",
            MutationAudit.created_at >= datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        ).count()

        verdict = self.policy.evaluate(
            action=action,
            payload=payload,
            today_spend_micros=today_spend_micros,
            today_action_count=today_actions,
        )

        audit = MutationAudit(
            user_id=None,  # System bot
            provider=provider,
            account_id=account_id,
            action=action,
            campaign_id=campaign_id,
            payload_hash=canonical_payload_hash(payload),
            mode=verdict.get("mode", "manual"),
            verdict_reason=verdict.get("reason", "policy-pass"),
            executed=False, # Wait for executor integration
            metrics=metrics
        )
        self.db.add(audit)
        self.db.commit()
        logger.info(f"Optimization decision logged: {action} on {campaign_id} -> {verdict.get('mode')}")
