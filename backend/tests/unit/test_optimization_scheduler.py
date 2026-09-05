import pytest
from app.services.optimization_scheduler import OptimizationSchedulerService
from app.models import MutationAudit
from app.core.executor import AutoModePolicy

def test_optimization_scheduler_disabled(db_session, monkeypatch):
    monkeypatch.setenv("ADS_AUTO_MODE", "false")
    service = OptimizationSchedulerService(db_session)
    service.run_optimization_scan()
    
    # Should not write audits if auto mode is disabled
    count = db_session.query(MutationAudit).count()
    assert count == 0

def test_optimization_scheduler_enabled(db_session, monkeypatch):
    monkeypatch.setenv("ADS_AUTO_MODE", "true")
    monkeypatch.setenv("ADS_AUTO_ACTIONS", "campaign.pause,budget.update")
    service = OptimizationSchedulerService(db_session)
    service.run_optimization_scan()

    audits = db_session.query(MutationAudit).all()
    assert len(audits) == 2
    assert audits[0].mode in ["auto", "manual"]
