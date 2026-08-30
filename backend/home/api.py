from ninja import Router
from django.http import HttpRequest
from pydantic import BaseModel
import os
from .gitofensive import fetch_contribution_calendar, calculate_streaks

router = Router()


# ── Schemas ─────────────────────────────────────────────────────────────────

class GithubStreakSchema(BaseModel):
    current_streak: int
    max_streak: int


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/github-streak", response=GithubStreakSchema, summary="Streak do GitHub do proprietário do site")
def get_github_streak(request: HttpRequest):
    current_streak = 0
    max_streak = 0
    try:
        username = os.getenv("GITHUB_USERNAME") or os.getenv("USERNAME")
        token = os.getenv("GITHUB_TOKEN")
        if username and token:
            raw_data = fetch_contribution_calendar(username, token)
            if 'errors' not in raw_data and raw_data.get('data', {}).get('user') is not None:
                current_streak, max_streak = calculate_streaks(raw_data)
    except Exception as e:
        print(f"Error fetching github streak: {e}")
    return GithubStreakSchema(current_streak=current_streak, max_streak=max_streak)
