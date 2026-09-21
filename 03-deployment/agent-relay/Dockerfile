FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    RELAY_DATABASE_URL=postgresql+psycopg://relay:relay_password@postgres:5432/agent_relay

WORKDIR /app

# Install only production dependencies into the image environment.
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev

COPY main.py database.py dashboard.py dashboard.html errors.py schemas.py storage.py worker.py ./

RUN useradd --create-home --uid 10001 relay \
    && mkdir -p /data \
    && chown -R relay:relay /app /data

USER relay

EXPOSE 8000

CMD ["uv", "run", "--no-dev", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
