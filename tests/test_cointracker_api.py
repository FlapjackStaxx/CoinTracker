from __future__ import annotations

from fastapi.testclient import TestClient

from cointracker.main import app

client = TestClient(app)


def test_healthcheck():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_crud_flow(tmp_path):
    # create
    payload = {
        "name": "1912 French 1 Franc",
        "country": "France",
        "denomination": "1 Franc",
        "year": 1912,
        "description": "Silver coin minted before WWI",
        "estimated_value": 25.5,
        "market_value": 32.0,
        "status": "owned",
        "notes": "Well preserved",
    }
    response = client.post("/items", json=payload)
    assert response.status_code == 201
    created = response.json()
    item_id = created["id"]

    # read
    response = client.get(f"/items/{item_id}")
    assert response.status_code == 200

    # list
    response = client.get("/items")
    assert response.status_code == 200
    items = response.json()
    assert any(item["id"] == item_id for item in items)

    # update
    update_payload = {"market_value": 40.0, "status": "sold"}
    response = client.patch(f"/items/{item_id}", json=update_payload)
    assert response.status_code == 200
    updated = response.json()
    assert updated["market_value"] == 40.0
    assert updated["status"] == "sold"

    # export
    response = client.get(f"/items/{item_id}/export")
    assert response.status_code == 200
    exported = response.json()
    assert exported["name"] == payload["name"]

    # delete
    response = client.delete(f"/items/{item_id}")
    assert response.status_code == 204

    # ensure deleted
    response = client.get(f"/items/{item_id}")
    assert response.status_code == 404


def test_recognize_currency():
    response = client.post(
        "/recognize",
        json={"filename": "french_franc.jpg", "mime_type": "image/jpeg"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "probable_match" in data
    assert 0 <= data["confidence"] <= 1

