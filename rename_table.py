import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
with connection.cursor() as cursor:
    cursor.execute('ALTER TABLE "Mycontador_calendariosemana" RENAME TO "contador_calendariosemana";')
print("Table renamed successfully.")
