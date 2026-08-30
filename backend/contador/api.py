from ninja import Router
from django.http import HttpRequest
from typing import List
from pydantic import BaseModel
import os
from .models import Habitos
from home.gitofensive import fetch_contribution_calendar, calculate_streaks

router = Router()


# ── Schemas ─────────────────────────────────────────────────────────────────

class HabitoSchema(BaseModel):
    id: str
    name: str
    desc: str
    startDate: str
    level: str


class GithubStreakSchema(BaseModel):
    current_streak: int


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/habitos", response=List[HabitoSchema], summary="Lista todos os hábitos")
def get_habitos(request: HttpRequest):
    qs = Habitos.objects.all()
    return [
        HabitoSchema(
            id=str(h.id),
            name=h.name,
            desc=h.description,
            startDate=h.start_date.isoformat(),
            level=h.level,
        )
        for h in qs
    ]


@router.get("/github-streak", response=GithubStreakSchema, summary="Retorna o streak atual do GitHub")
def get_github_streak(request: HttpRequest):
    streak_count = 0
    try:
        username = os.getenv("GITHUB_USERNAME") or os.getenv("USERNAME")
        token = os.getenv("GITHUB_TOKEN")
        if username and token:
            raw_data = fetch_contribution_calendar(username, token)
            if 'errors' not in raw_data and raw_data.get('data', {}).get('user') is not None:
                current, maximum = calculate_streaks(raw_data)
                streak_count = current
    except Exception as e:
        print(f"Error fetching github streak: {e}")
    return GithubStreakSchema(current_streak=streak_count)
