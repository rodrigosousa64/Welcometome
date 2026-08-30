from django.urls import path
from . import views

urlpatterns = [
    path('', views.calendario_home, name='calendario_home'),
    path('api/calendario/', views.api_calendario, name='api_calendario'),
    path('api/calendario/semana/update/', views.api_update_semana, name='api_update_semana'),
    path('api/calendario/bloco/update/', views.api_update_bloco, name='api_update_bloco'),
    path('api/calendario/marco/add/', views.api_add_marco, name='api_add_marco'),
    path('api/calendario/marco/edit/', views.api_edit_marco, name='api_edit_marco'),
    path('api/calendario/marco/delete/', views.api_delete_marco, name='api_delete_marco'),
]

