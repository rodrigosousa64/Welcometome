from django.urls import path
from .CrudLivros import meuslivros
from .views import criar_livro

urlpatterns = [
    path("", meuslivros, name="meuslivros"),
    path("criar/", criar_livro, name="criar_livro"),
]