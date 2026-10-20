import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT", "3")
    for k in ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "CONTACT_TO"):
        monkeypatch.delenv(k, raising=False)
    import main

    importlib.reload(main)
    return main, TestClient(main.app)


GOOD = {"name": "Test Person", "email": "test@example.com", "message": "Hello there, this is a test."}


def test_validation_rejects_bad_email(client):
    _, c = client
    r = c.post("/contact", json={**GOOD, "email": "nope"})
    assert r.status_code == 422


def test_header_injection_rejected(client):
    _, c = client
    r = c.post("/contact", json={**GOOD, "name": "Eve\r\nBcc: x@example.com"})
    assert r.status_code == 422


def test_honeypot_silently_accepted(client):
    _, c = client
    r = c.post("/contact", json={**GOOD, "website": "spam.example"})
    assert r.status_code == 202


def test_unconfigured_delivery_is_503(client):
    _, c = client
    assert c.post("/contact", json=GOOD).status_code == 503


def test_delivery_called_when_configured(client, monkeypatch):
    main, c = client
    for k in ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "CONTACT_TO"):
        monkeypatch.setenv(k, "x")
    sent = []
    monkeypatch.setattr(main, "send", lambda m: sent.append(m))
    assert c.post("/contact", json=GOOD).status_code == 202
    assert sent and sent[0].email == "test@example.com"


def test_rate_limit(client):
    _, c = client
    codes = [c.post("/contact", json=GOOD).status_code for _ in range(4)]
    assert codes[-1] == 429


def test_body_too_large(client):
    _, c = client
    r = c.post("/contact", content=b"{" + b" " * 9000 + b"}", headers={"Content-Type": "application/json"})
    assert r.status_code == 413
