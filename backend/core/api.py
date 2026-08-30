from ninja import NinjaAPI
from ninja.security import django_auth

api = NinjaAPI(
    title="Welcometome API",
    version="1.0.0",
    description="API do projeto Welcometome",
    auth=None,  # autenticação por endpoint/router
    urls_namespace="api",
)

from calendario.api import router as calendario_router
from contador.api import router as contador_router
from livros.api import router as livros_router
from home.api import router as home_router

api.add_router("/calendario", calendario_router, tags=["Calendário"])
api.add_router("/contador", contador_router, tags=["Contador / Hábitos"])
api.add_router("/livros", livros_router, tags=["Livros"])
api.add_router("/home", home_router, tags=["Home"])
