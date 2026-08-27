from django import forms
from .models import Habitos

class HabitoForm(forms.ModelForm):
    class Meta:
        model = Habitos
        fields = ['name', 'description', 'start_date']