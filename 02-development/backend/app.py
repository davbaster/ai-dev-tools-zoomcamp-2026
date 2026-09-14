from datetime import datetime
from typing import Literal
from uuid import uuid4

from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, model_validator

app = FastAPI(title="HostBoard API")


class EntryIn(BaseModel):
    party_name: str = Field(min_length=1)
    party_size: int = Field(gt=0)
    phone: str = Field(min_length=1)
    special_request: str = Field(min_length=1)
    estimated_arrival_time: str
    estimated_wait_time: int | None = Field(default=None, ge=0)
    reservation_date: str | None = None
    reservation_time: str | None = None


class AssignmentIn(BaseModel):
    table_ids: list[str] = Field(min_length=1)
    confirm_overlap: bool = False


class StaffIn(BaseModel):
    name: str = Field(min_length=1)
    role: Literal["host", "server", "manager"]


class TableIn(BaseModel):
    label: str = Field(min_length=1)
    capacity: int = Field(gt=0)


STORE: dict = {}


def now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def reset_store() -> None:
    global STORE
    STORE = {
        "staff": [
            {"id": "u1", "name": "Marina Cruz", "role": "host", "active": True},
            {"id": "u2", "name": "Evan Lee", "role": "server", "active": True},
            {"id": "u3", "name": "Ari Bennett", "role": "manager", "active": True},
        ],
        "tables": [
            {"id": f"t{i}", "label": f"{i:02}", "capacity": c, "availability": "occupied" if i == 2 else "available", "active": True, "released_at": None}
            for i, c in enumerate([2, 2, 4, 4, 6, 2], 1)
        ],
        "entries": [],
    }


reset_store()


def role(x_staff_role: str | None = Header(default=None)) -> str:
    if x_staff_role not in {"host", "server", "manager"}:
        raise HTTPException(401, "Sign in required")
    return x_staff_role


def allowed(*roles: str):
    def check(current: str = Depends(role)) -> str:
        if current not in roles:
            raise HTTPException(403, "This role cannot perform that action")
        return current
    return check


def entry_or_404(entry_id: str) -> dict:
    entry = next((e for e in STORE["entries"] if e["id"] == entry_id), None)
    if not entry:
        raise HTTPException(404, "Guest entry not found")
    return entry


def table_or_404(table_id: str) -> dict:
    table = next((t for t in STORE["tables"] if t["id"] == table_id), None)
    if not table:
        raise HTTPException(404, "Table not found")
    return table


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/entries/walk-ins", status_code=status.HTTP_201_CREATED)
def create_walkin(payload: EntryIn, current: str = Depends(allowed("host", "manager"))):
    entry = payload.model_dump()
    entry.update({"id": str(uuid4()), "type": "walk-in", "status": "waiting", "created_at": now(), "created_by_role": current, "tables": [], "seated_at": None, "cancelled_at": None, "no_show_at": None})
    STORE["entries"].append(entry)
    return entry


@app.post("/entries/reservations", status_code=status.HTTP_201_CREATED)
def create_reservation(payload: EntryIn, current: str = Depends(allowed("host", "manager"))):
    if not payload.reservation_date or not payload.reservation_time:
        raise HTTPException(422, "Reservation date and time are required")
    entry = create_walkin(payload, current)
    entry["type"] = "reservation"
    return entry


@app.get("/entries")
def list_entries(q: str = "", entry_type: str | None = None, current: str = Depends(role)):
    needle = q.lower()
    return [e for e in STORE["entries"] if (not entry_type or e["type"] == entry_type) and (not needle or needle in e["party_name"].lower() or needle in e["phone"].lower())]


@app.patch("/entries/{entry_id}", status_code=405)
def immutable_entry(entry_id: str, current: str = Depends(allowed("host", "manager"))):
    entry_or_404(entry_id)
    return {"detail": "Guest details are immutable after creation"}


@app.post("/entries/{entry_id}/assignments")
def assign(entry_id: str, payload: AssignmentIn, current: str = Depends(allowed("host", "manager"))):
    entry = entry_or_404(entry_id)
    tables = [table_or_404(tid) for tid in payload.table_ids]
    if any(not t["active"] for t in tables):
        raise HTTPException(409, "An inactive table cannot be assigned")
    overlaps = [t["id"] for t in tables if t["availability"] == "reserved" and t.get("reservation_id") != entry_id]
    if entry["type"] == "reservation" and overlaps and not payload.confirm_overlap:
        return JSONResponse(status_code=409, content={"overlap_warning": True, "table_ids": overlaps})
    if any(t["availability"] == "occupied" for t in tables):
        raise HTTPException(409, "An occupied table cannot be assigned")
    entry["tables"] = payload.table_ids
    if entry["type"] == "reservation":
        for table in tables:
            table.update({"availability": "reserved", "reservation_id": entry_id})
    return {"entry": entry, "capacity_warning": sum(t["capacity"] for t in tables) < entry["party_size"], "overlap_warning": bool(overlaps)}


@app.post("/entries/{entry_id}/seat")
def seat(entry_id: str, current: str = Depends(allowed("host", "manager"))):
    entry = entry_or_404(entry_id)
    if not entry["tables"]:
        raise HTTPException(409, "A guest needs an assigned table before seating")
    entry["status"], entry["seated_at"] = "seated", now()
    for table_id in entry["tables"]:
        table_or_404(table_id).update({"availability": "occupied", "party_id": entry_id})
    return entry


@app.post("/entries/{entry_id}/status/{new_status}")
def change_status(entry_id: str, new_status: Literal["cancelled", "no-show"], current: str = Depends(allowed("host", "manager"))):
    entry = entry_or_404(entry_id)
    entry["status"], entry[f"{new_status.replace('-', '_')}_at"] = new_status, now()
    for table_id in entry["tables"]:
        table = table_or_404(table_id)
        if table.get("party_id") == entry_id or table.get("reservation_id") == entry_id:
            table.update({"availability": "available"})
            table.pop("party_id", None); table.pop("reservation_id", None)
    return entry


@app.get("/tables")
def list_tables(current: str = Depends(role)):
    return [t for t in STORE["tables"] if t["active"]]


@app.post("/tables", status_code=201)
def create_table(payload: TableIn, current: str = Depends(allowed("manager"))):
    if any(t["label"] == payload.label for t in STORE["tables"]):
        raise HTTPException(409, "Table label must be unique")
    table = {"id": f"t{len(STORE['tables']) + 1}", **payload.model_dump(), "availability": "available", "active": True, "released_at": None}
    STORE["tables"].append(table)
    return table


@app.post("/tables/{table_id}/release")
def release(table_id: str, current: str = Depends(allowed("server", "manager"))):
    table = table_or_404(table_id)
    if table["availability"] != "occupied":
        raise HTTPException(409, "Only occupied tables can be released")
    table.update({"availability": "available", "released_at": now()})
    table.pop("party_id", None)
    return table


@app.post("/staff", status_code=201)
def create_staff(payload: StaffIn, current: str = Depends(allowed("manager"))):
    staff = {"id": str(uuid4()), **payload.model_dump(), "active": True, "created_at": now()}
    STORE["staff"].append(staff)
    return staff


@app.get("/reports/daily")
def report(date: str, current: str = Depends(allowed("manager"))):
    entries = STORE["entries"]
    seated = [e for e in entries if e["status"] == "seated"]
    waits = [e["estimated_wait_time"] for e in seated if e["estimated_wait_time"] is not None]
    return {"date": date, "individual_wait_minutes": waits, "average_wait_minutes": sum(waits) / len(waits) if waits else 0, "cancellations": sum(e["status"] == "cancelled" for e in entries), "no_shows": sum(e["status"] == "no-show" for e in entries), "table_turnover": sum(t["released_at"] is not None for t in STORE["tables"]), "covers_served": sum(e["party_size"] for e in seated)}
