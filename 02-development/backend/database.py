"""Database-agnostic persistence for the current mock-domain API.

Set DATABASE_URL for another SQLAlchemy database. SQLite is the local default.
"""
import os

from sqlalchemy import JSON, Integer, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hostboard.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)


class Base(DeclarativeBase):
    pass


class ApplicationState(Base):
    __tablename__ = "application_state"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    payload: Mapped[dict] = mapped_column(JSON)


def create_schema() -> None:
    Base.metadata.create_all(engine)


def load_state(default: dict) -> dict:
    create_schema()
    with Session(engine) as session:
        state = session.get(ApplicationState, 1)
        if state is None:
            state = ApplicationState(id=1, payload=default)
            session.add(state)
            session.commit()
        return state.payload


def save_state(payload: dict) -> None:
    create_schema()
    with Session(engine) as session:
        state = session.get(ApplicationState, 1)
        if state is None:
            session.add(ApplicationState(id=1, payload=payload))
        else:
            state.payload = payload
        session.commit()
