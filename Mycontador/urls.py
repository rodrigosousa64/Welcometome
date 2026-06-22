from django.urls import path
from . import views

urlpatterns = [
    path('', views.painel_telemetria, name='painel_telemetria'),
    path('aniversario/', views.aniversario, name='aniversario'),
]
