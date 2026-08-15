from django import forms
from .models import Habitos, Calendario

class HabitoForm(forms.ModelForm):
    class Meta:
        model = Habitos
        fields = ['name', 'description', 'start_date']


class CalendarioForm(forms.ModelForm):
    class Meta:
        model = Calendario
        fields = ['nome', 'quantidade_semanas', 'data_inicio']