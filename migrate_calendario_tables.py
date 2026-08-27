import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

def rename_tables():
    with connection.cursor() as cursor:
        try:
            cursor.execute('ALTER TABLE "contador_calendario" RENAME TO "calendario_calendario";')
            print("Renamed contador_calendario -> calendario_calendario")
        except Exception as e:
            print(f"Skipping contador_calendario rename: {e}")
            
        try:
            cursor.execute('ALTER TABLE "contador_calendariosemana" RENAME TO "calendario_calendariosemana";')
            print("Renamed contador_calendariosemana -> calendario_calendariosemana")
        except Exception as e:
            print(f"Skipping contador_calendariosemana rename: {e}")
            
        try:
            cursor.execute("UPDATE django_content_type SET app_label = 'calendario' WHERE app_label = 'contador' AND model IN ('calendario', 'calendariosemana');")
            print("Updated django_content_type")
        except Exception as e:
            print(f"Skipping content type update: {e}")

if __name__ == '__main__':
    rename_tables()
