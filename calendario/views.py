from django.http import JsonResponse
from django.shortcuts import render
import json
from .models import Calendario, CalendarioSemana

def calendario_home(request):
    return render(request, 'calendario/calendario.html')

def api_calendario(request):
    """API endpoint: retorna os blocos do calendário do DB como JSON."""
    qs = Calendario.objects.all().order_by('data_inicio')
    data = []
    for c in qs:
        semanas_data = []
        for s in c.semanas.all().order_by('numero_semana'):
            semanas_data.append({
                'id': s.id,
                'numero_semana': s.numero_semana,
                'week_title': s.week_title,
                'main_objective': s.main_objective,
                'is_milestone': s.is_milestone
            })
        
        data.append({
            'id': c.id,
            'title': c.nome,
            'block_theme': c.block_theme,
            'weeks': c.quantidade_semanas,
            'start': c.data_inicio.isoformat() + 'T00:00:00',
            'end': c.data_fim.isoformat() + 'T23:59:59' if c.data_fim else '',
            'semanas': semanas_data,
        })
    return JsonResponse(data, safe=False)

def api_update_semana(request):
    if request.method == 'POST':
        if not request.user.is_authenticated or not request.user.is_superuser:
            return JsonResponse({'error': 'Não autorizado'}, status=403)
        
        try:
            data = json.loads(request.body)
            semana_id = data.get('semana_id')
            main_objective = data.get('main_objective', '')
            
            semana = CalendarioSemana.objects.get(id=semana_id)
            semana.main_objective = main_objective
            semana.save()
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método não permitido'}, status=405)
