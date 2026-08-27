from django import forms
from .models import Calendario

class CalendarioForm(forms.ModelForm):
    class Meta:
        model = Calendario
        fields = ['nome', 'quantidade_semanas', 'data_inicio']
