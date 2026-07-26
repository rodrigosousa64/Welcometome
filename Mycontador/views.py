from django.shortcuts import render
from django.http import JsonResponse
from home.gitofensive import fetch_contribution_calendar, calculate_streaks
from .models import Habitos, Calendario
import os

def github_streak(request):
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

    return render(request, 'Mycontador/github_streak.html', {'github_streak': streak_count})

def aniversario(request):
    return render(request, 'Mycontador/aniversario.html')

def api_habitos(request):
    """API endpoint: retorna todos os hábitos do DB como JSON."""
    qs = Habitos.objects.all()
    data = [
        {
            'id':        str(h.id),
            'name':      h.name,
            'desc':      h.description,
            # isoformat() → 'YYYY-MM-DD' — fácil de parsear no JS
            'startDate': h.start_date.isoformat(),
            'level':     h.level,
        }
        for h in qs
    ]
    return JsonResponse(data, safe=False)

def api_calendario(request):
    """API endpoint: retorna os blocos do calendário do DB como JSON."""
    qs = Calendario.objects.all().order_by('data_inicio')
    data = []
    for c in qs:
        data.append({
            'id': c.id,
            'title': c.nome,
            'weeks': c.quantidade_semanas,
            'start': c.data_inicio.isoformat() + 'T00:00:00',
            'end': c.data_fim.isoformat() + 'T23:59:59' if c.data_fim else '',
        })
    return JsonResponse(data, safe=False)
