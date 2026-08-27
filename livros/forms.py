from django import forms
from .models import Livros

class LivroForm(forms.ModelForm):
    class Meta:
        model = Livros
        fields = ['name', 'description', 'autor', 'urlimagem', 'lido', 'data_leitura']
