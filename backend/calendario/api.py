from ninja import Router
from ninja.security import django_auth
from django.http import HttpRequest
from typing import List, Optional
from datetime import date
from pydantic import BaseModel
from .models import Calendario, CalendarioSemana, Marco
import json

router = Router()


# ── Schemas ─────────────────────────────────────────────────────────────────

class MarcoSchema(BaseModel):
    id: int
    descricao: str


class SemanaSchema(BaseModel):
    id: int
    numero_semana: int
    week_title: str
    main_objective: str
    is_milestone: bool
    marcos: List[MarcoSchema]


class CalendarioSchema(BaseModel):
    id: int
    title: str
    block_theme: str
    weeks: int
    start: str
    end: str
    semanas: List[SemanaSchema]


class UpdateSemanaPayload(BaseModel):
    semana_id: int
    main_objective: Optional[str] = None
    week_title: Optional[str] = None
    is_milestone: Optional[bool] = None


class UpdateBlocoPayload(BaseModel):
    bloco_id: int
    nome: Optional[str] = None
    block_theme: Optional[str] = None


class AddMarcoPayload(BaseModel):
    semana_id: int
    descricao: str


class EditMarcoPayload(BaseModel):
    marco_id: int
    descricao: str


class DeleteMarcoPayload(BaseModel):
    marco_id: int


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/", response=List[CalendarioSchema], summary="Lista todos os blocos do calendário")
def get_calendario(request: HttpRequest):
    qs = Calendario.objects.prefetch_related('semanas', 'semanas__marcos').order_by('data_inicio')
    result = []
    for c in qs:
        semanas_data = []
        for s in sorted(c.semanas.all(), key=lambda x: x.numero_semana):
            marcos_data = [MarcoSchema(id=m.id, descricao=m.descricao) for m in s.marcos.all()]
            semanas_data.append(SemanaSchema(
                id=s.id,
                numero_semana=s.numero_semana,
                week_title=s.week_title or "",
                main_objective=s.main_objective or "",
                is_milestone=s.is_milestone,
                marcos=marcos_data,
            ))
        result.append(CalendarioSchema(
            id=c.id,
            title=c.nome,
            block_theme=c.block_theme or "",
            weeks=c.quantidade_semanas,
            start=c.data_inicio.isoformat() + 'T00:00:00',
            end=c.data_fim.isoformat() + 'T23:59:59' if c.data_fim else '',
            semanas=semanas_data,
        ))
    return result


@router.post("/semana/update", response={200: dict, 403: dict, 404: dict}, summary="Atualiza dados de uma semana")
def update_semana(request: HttpRequest, payload: UpdateSemanaPayload):
    if not request.user.is_authenticated or not (request.user.is_superuser or request.user.is_staff):
        return 403, {"error": "Não autorizado"}

    try:
        semana = CalendarioSemana.objects.get(id=payload.semana_id)
        if payload.main_objective is not None:
            semana.main_objective = payload.main_objective
        if payload.week_title is not None:
            semana.week_title = payload.week_title
        if payload.is_milestone is not None:
            semana.is_milestone = payload.is_milestone
        semana.save()
        return {
            "status": "success",
            "semana": {
                "id": semana.id,
                "numero_semana": semana.numero_semana,
                "week_title": semana.week_title,
                "main_objective": semana.main_objective,
                "is_milestone": semana.is_milestone,
            }
        }
    except CalendarioSemana.DoesNotExist:
        return 404, {"error": "Semana não encontrada"}


@router.post("/bloco/update", response={200: dict, 403: dict, 404: dict}, summary="Atualiza dados de um bloco")
def update_bloco(request: HttpRequest, payload: UpdateBlocoPayload):
    if not request.user.is_authenticated or not (request.user.is_superuser or request.user.is_staff):
        return 403, {"error": "Não autorizado"}

    try:
        bloco = Calendario.objects.get(id=payload.bloco_id)
        if payload.nome:
            bloco.nome = payload.nome.strip() or bloco.nome
        if payload.block_theme is not None:
            bloco.block_theme = payload.block_theme.strip()
        bloco.save()
        return {
            "status": "success",
            "bloco": {
                "id": bloco.id,
                "nome": bloco.nome,
                "block_theme": bloco.block_theme,
                "weeks": bloco.quantidade_semanas,
            }
        }
    except Calendario.DoesNotExist:
        return 404, {"error": "Bloco não encontrado"}


@router.post("/marco/add", response={200: dict, 403: dict, 404: dict}, summary="Adiciona um marco a uma semana")
def add_marco(request: HttpRequest, payload: AddMarcoPayload):
    if not request.user.is_authenticated or not (request.user.is_superuser or request.user.is_staff):
        return 403, {"error": "Não autorizado"}

    try:
        semana = CalendarioSemana.objects.get(id=payload.semana_id)
        marco = Marco.objects.create(semana=semana, descricao=payload.descricao)
        return {"status": "success", "marco": {"id": marco.id, "descricao": marco.descricao}}
    except CalendarioSemana.DoesNotExist:
        return 404, {"error": "Semana não encontrada"}


@router.post("/marco/edit", response={200: dict, 403: dict, 404: dict}, summary="Edita a descrição de um marco")
def edit_marco(request: HttpRequest, payload: EditMarcoPayload):
    if not request.user.is_authenticated or not (request.user.is_superuser or request.user.is_staff):
        return 403, {"error": "Não autorizado"}

    try:
        marco = Marco.objects.get(id=payload.marco_id)
        marco.descricao = payload.descricao
        marco.save()
        return {"status": "success", "marco": {"id": marco.id, "descricao": marco.descricao}}
    except Marco.DoesNotExist:
        return 404, {"error": "Marco não encontrado"}


@router.post("/marco/delete", response={200: dict, 403: dict, 404: dict}, summary="Remove um marco")
def delete_marco(request: HttpRequest, payload: DeleteMarcoPayload):
    if not request.user.is_authenticated or not (request.user.is_superuser or request.user.is_staff):
        return 403, {"error": "Não autorizado"}

    try:
        marco = Marco.objects.get(id=payload.marco_id)
        marco.delete()
        return {"status": "success"}
    except Marco.DoesNotExist:
        return 404, {"error": "Marco não encontrado"}
