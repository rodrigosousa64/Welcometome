from django.shortcuts import render, redirect
from .models import Livros
from .forms import LivroForm

def criar_livro(request):
    if request.method == 'POST':
        form = LivroForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('meuslivros')
    else:
        form = LivroForm()
    return render(request, 'Mylivros/criar_livro.html', {'form': form})
