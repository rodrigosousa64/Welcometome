from django.urls import path
from . import views

urlpatterns = [
    path('', views.github_streak, name='github_streak'),

    path('aniversario/', views.aniversario, name='aniversario'),
    path('api/habitos/', views.api_habitos, name='api_habitos'),
]
