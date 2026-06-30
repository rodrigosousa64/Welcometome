from django.urls import path
from .views import meuslivros


urlpatterns = [
    path("", meuslivros, name="meuslivros")
]