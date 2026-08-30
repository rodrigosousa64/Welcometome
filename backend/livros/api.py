from ninja import Router
from ninja.security import django_auth
from django.http import HttpRequest
from typing import List, Optional
from ninja import Schema
from datetime import date
from .models import Livros

router = Router()


# ── Schemas ─────────────────────────────────────────────────────────────────

class LivroSchema(Schema):
    id: int
    name: str
    description: str
    autor: str
    urlimagem: str
    lido: bool
    data_leitura: Optional[date] = None

    class Config:
        from_attributes = True


class CreateLivroPayload(Schema):
    name: str
    description: str
    autor: str
    urlimagem: str
    lido: bool = False
    data_leitura: Optional[date] = None


class UpdateLivroPayload(Schema):
    name: Optional[str] = None
    description: Optional[str] = None
    autor: Optional[str] = None
    urlimagem: Optional[str] = None
    lido: Optional[bool] = None
    data_leitura: Optional[date] = None


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/", response=List[LivroSchema], summary="Lista todos os livros")
def get_livros(request: HttpRequest):
    return list(Livros.objects.all().order_by('-id'))


@router.post("/", response=LivroSchema, summary="Cria um novo livro", auth=django_auth)
def create_livro(request: HttpRequest, payload: CreateLivroPayload):
    livro = Livros.objects.create(**payload.model_dump())
    return livro


@router.put("/{livro_id}", response=LivroSchema, summary="Atualiza um livro", auth=django_auth)
def update_livro(request: HttpRequest, livro_id: int, payload: UpdateLivroPayload):
    try:
        livro = Livros.objects.get(id=livro_id)
        for attr, value in payload.model_dump(exclude_none=True).items():
            setattr(livro, attr, value)
        livro.save()
        return livro
    except Livros.DoesNotExist:
        return {"error": "Livro não encontrado"}, 404


@router.delete("/{livro_id}", summary="Remove um livro", auth=django_auth)
def delete_livro(request: HttpRequest, livro_id: int):
    try:
        livro = Livros.objects.get(id=livro_id)
        livro.delete()
        return {"status": "success"}
    except Livros.DoesNotExist:
        return {"error": "Livro não encontrado"}, 404
