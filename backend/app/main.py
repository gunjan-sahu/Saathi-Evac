import warnings
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from . import models  # noqa: F401  (registers tables)
from .security import SECRET_KEY
from .routers import auth, people, helpers, alerts, dispatch, governance


@asynccontextmanager
async def lifespan(app):
    if SECRET_KEY == "dev-only-change-me":
        warnings.warn("Using the default SECRET_KEY. Set a real one before any real use.")
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="Saathi-Evac API", version="0.2.0", lifespan=lifespan,
              description="Proposed design, prototype stage. Login at /auth/login, then click Authorize and paste the token.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
for r in (auth.router, people.router, helpers.router, alerts.router, dispatch.router, governance.router):
    app.include_router(r)


@app.get("/")
def health():
    return {"status": "ok", "project": "Saathi-Evac (proposed design, prototype stage)"}
