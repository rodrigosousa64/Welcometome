from django.shortcuts import render
from home.gitofensive import fetch_contribution_calendar, calculate_streaks
import os

def painel_telemetria(request):
    github_streak = 0
    try:
        username = os.getenv("GITHUB_USERNAME") or os.getenv("USERNAME")
        token = os.getenv("GITHUB_TOKEN")
        if username and token:
            raw_data = fetch_contribution_calendar(username, token)
            if 'errors' not in raw_data and raw_data.get('data', {}).get('user') is not None:
                current, maximum = calculate_streaks(raw_data)
                github_streak = current
    except Exception as e:
        print(f"Error fetching github streak: {e}")

    return render(request, 'Mycontador/painel_telemetria.html', {'github_streak': github_streak})

def aniversario(request):
    return render(request, 'Mycontador/aniversario.html')
