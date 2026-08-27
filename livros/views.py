from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Livros
from .forms import LivroForm

@login_required(login_url='/admin/login/')
def criar_livro(request):
    if request.method == 'POST':
        form = LivroForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('meuslivros')
    else:
        form = LivroForm()
    return render(request, 'livros/criar_livro.html', {'form': form})
