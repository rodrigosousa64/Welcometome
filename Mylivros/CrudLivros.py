from django.shortcuts import render
from .models import Livros

# Create your views here.
def meuslivros(request):
    livros = Livros.objects.all().order_by('-id')
    return render(request, "Mylivros/meuslivros.html", {"livros": livros})