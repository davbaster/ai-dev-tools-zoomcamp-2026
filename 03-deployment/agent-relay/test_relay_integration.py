"""Opt-in integration coverage for a running Agent Relay instance.

Unlike ``test_agent_relay.py``, this test talks to a separately running ASGI
server over HTTP and checks the database that server uses. It never resets or
deletes that database: each run creates uniquely named agents and one task.

Run it deliberately against a local instance, for example:

    $env:RELAY_INTEGRATION_BASE_URL = "http://127.0.0.1:8000"
    $env:RELAY_INTEGRATION_DATABASE_URL = "sqlite:///./agent-relay.db"
    uv run pytest -q test_relay_integration.py
"""

from __future__ import annotations

import os
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from database import Agent, Attempt, Task


pytestmark = pytest.mark.integration


@pytest.fixture
def running_relay() -> tuple[str, str]:
    """Return the explicitly selected live API and its database URL."""

    base_url = os.getenv("RELAY_INTEGRATION_BASE_URL")
    database_url = os.getenv("RELAY_INTEGRATION_DATABASE_URL")
    if not base_url or not database_url:
        pytest.skip(
            "Set RELAY_INTEGRATION_BASE_URL and RELAY_INTEGRATION_DATABASE_URL "
            "to run the live relay integration test."
        )
    return base_url.rstrip("/"), database_url


def register(client: httpx.Client, name: str) -> dict[str, str]:
    response = client.post("/api/v1/agents", json={"name": name})
    assert response.status_code == 201, response.text
    return response.json()


def test_agents_exchange_a_task_and_result_over_live_api_and_database(running_relay: tuple[str, str]):
    """Acceptance scenario 1: sender -> recipient -> completed result."""

    base_url, database_url = running_relay
    suffix = uuid4().hex[:12]
    expected_input = "Return the relay acceptance result."
    expected_output = "Acceptance scenario completed successfully."

    with httpx.Client(base_url=base_url, timeout=10.0) as client:
        sender = register(client, f"integration-sender-{suffix}")
        recipient = register(client, f"integration-recipient-{suffix}")
        sender_headers = {
            "Authorization": f"Bearer {sender['token']}",
            "Idempotency-Key": f"integration-{suffix}",
        }
        recipient_headers = {"Authorization": f"Bearer {recipient['token']}"}

        submitted = client.post(
            "/api/v1/tasks",
            headers=sender_headers,
            json={"to": recipient["agent_id"], "input": expected_input},
        )
        assert submitted.status_code == 201, submitted.text
        task_id = submitted.json()["task_id"]
        assert submitted.json()["status"] == "queued"

        claimed = client.post(
            "/api/v1/tasks/claim",
            headers=recipient_headers,
            json={"worker_id": f"integration-worker-{suffix}", "wait_seconds": 0},
        )
        assert claimed.status_code == 200, claimed.text
        claim = claimed.json()
        assert claim["task_id"] == task_id
        assert claim["input"] == expected_input
        assert claim["attempt"] == 1

        completed = client.post(
            f"/api/v1/tasks/{task_id}/complete",
            headers=recipient_headers,
            json={"claim_token": claim["claim_token"], "output": expected_output},
        )
        assert completed.status_code == 200, completed.text
        assert completed.json()["status"] == "completed"

        sender_view = client.get(f"/api/v1/tasks/{task_id}", headers=sender_headers)
        assert sender_view.status_code == 200, sender_view.text
        assert sender_view.json()["status"] == "completed"
        assert sender_view.json()["output"] == expected_output

    # Use a separate engine and session to verify the database written by the
    # running server rather than sharing the server application's session.
    db_engine = create_engine(database_url)
    try:
        with Session(db_engine) as db:
            persisted_sender = db.get(Agent, sender["agent_id"])
            persisted_recipient = db.get(Agent, recipient["agent_id"])
            persisted_task = db.get(Task, task_id)
            persisted_attempt = db.scalar(select(Attempt).where(Attempt.task_id == task_id))

            assert persisted_sender is not None
            assert persisted_recipient is not None
            assert persisted_task is not None
            assert persisted_task.sender_id == sender["agent_id"]
            assert persisted_task.recipient_id == recipient["agent_id"]
            assert persisted_task.input == expected_input
            assert persisted_task.status == "completed"
            assert persisted_task.output == expected_output
            assert persisted_task.attempt_count == 1
            assert persisted_task.finished_at is not None
            assert persisted_attempt is not None
            assert persisted_attempt.attempt_number == 1
            assert persisted_attempt.outcome == "completed"
            assert persisted_attempt.worker_id == f"integration-worker-{suffix}"
            assert persisted_attempt.finished_at is not None
            # Only a hash is persisted; the claim secret is not stored.
            assert persisted_attempt.claim_token_hash != claim["claim_token"]
    finally:
        db_engine.dispose()
