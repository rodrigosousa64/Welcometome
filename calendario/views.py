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
        if not request.user.is_authenticated or not (request.user.is_superuser or request.user.is_staff):
            return JsonResponse({'error': 'Não autorizado'}, status=403)
        
        try:
            data = json.loads(request.body)
            semana_id = data.get('semana_id')
            if not semana_id:
                return JsonResponse({'error': 'ID da semana não informado'}, status=400)
            
            semana = CalendarioSemana.objects.get(id=semana_id)
            
            if 'main_objective' in data:
                semana.main_objective = data.get('main_objective', '')
            if 'week_title' in data:
                semana.week_title = data.get('week_title', '')
            if 'is_milestone' in data:
                semana.is_milestone = bool(data.get('is_milestone'))
                
            semana.save()
            return JsonResponse({
                'status': 'success',
                'semana': {
                    'id': semana.id,
                    'numero_semana': semana.numero_semana,
                    'week_title': semana.week_title,
                    'main_objective': semana.main_objective,
                    'is_milestone': semana.is_milestone
                }
            })
        except CalendarioSemana.DoesNotExist:
            return JsonResponse({'error': 'Semana não encontrada'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método não permitido'}, status=405)

def api_update_bloco(request):
    if request.method == 'POST':
        if not request.user.is_authenticated or not (request.user.is_superuser or request.user.is_staff):
            return JsonResponse({'error': 'Não autorizado'}, status=403)
        
        try:
            data = json.loads(request.body)
            bloco_id = data.get('bloco_id')
            if not bloco_id:
                return JsonResponse({'error': 'ID do bloco não informado'}, status=400)
            
            bloco = Calendario.objects.get(id=bloco_id)
            
            if 'nome' in data:
                bloco.nome = data.get('nome', '').strip() or bloco.nome
            if 'block_theme' in data:
                bloco.block_theme = data.get('block_theme', '').strip()
                
            bloco.save()
            return JsonResponse({
                'status': 'success',
                'bloco': {
                    'id': bloco.id,
                    'nome': bloco.nome,
                    'block_theme': bloco.block_theme,
                    'weeks': bloco.quantidade_semanas
                }
            })
        except Calendario.DoesNotExist:
            return JsonResponse({'error': 'Bloco não encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método não permitido'}, status=405)

