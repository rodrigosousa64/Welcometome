from django.urls import path
from .CrudLivros import meuslivros


urlpatterns = [
    path("", meuslivros, name="meuslivros")
]