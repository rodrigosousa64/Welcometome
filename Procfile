release: cd backend && python manage.py migrate
web: cd backend && gunicorn core.wsgi --bind 0.0.0.0:$PORT
