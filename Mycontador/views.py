from django.shortcuts import render

def painel_telemetria(request):
    return render(request, 'Mycontador/painel_telemetria.html')
