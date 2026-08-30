import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from calendario.models import Calendario, CalendarioSemana

for c in Calendario.objects.all():
    current_weeks = c.semanas.count()
    if current_weeks < c.quantidade_semanas:
        print(f"Fixing {c.nome}, missing {c.quantidade_semanas - current_weeks} weeks...")
        for i in range(current_weeks + 1, c.quantidade_semanas + 1):
            CalendarioSemana.objects.get_or_create(
                calendario=c,
                numero_semana=i
            )
print("Done!")
