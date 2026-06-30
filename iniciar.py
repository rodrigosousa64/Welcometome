import os
import time
import threading
import webbrowser
from django.core.management import execute_from_command_line

def abrir_navegador():
    # Espera 2 segundos para dar tempo de o servidor Django iniciar
    time.sleep(2) 
    webbrowser.open("http://127.0.0.1:8000/")

def main():
    # Define o módulo de configurações do seu projeto Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    
    # Inicia uma thread em segundo plano para abrir o navegador
    threading.Thread(target=abrir_navegador, daemon=True).start()
    
    # Inicia o servidor web local do Django
    # O '--noreload' é importante quando compilamos para executável
    argumentos = ['manage.py', 'runserver', '127.0.0.1:8000', '--noreload']
    execute_from_command_line(argumentos)

if __name__ == '__main__':
    main()
