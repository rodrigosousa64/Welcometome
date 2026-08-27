from django.urls import path
from . import views

urlpatterns = [
    path('', views.calendario_home, name='calendario_home'),
    path('api/calendario/', views.api_calendario, name='api_calendario'),
    path('api/calendario/semana/update/', views.api_update_semana, name='api_update_semana'),
]
