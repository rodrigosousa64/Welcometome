#!/usr/bin/env bash
# Saia em caso de erro
set -o errexit

echo "Instalando dependências e realizando build do Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Instalando dependências do Backend..."
cd backend
pip install -r requirements.txt

echo "Coletando arquivos estáticos..."
python manage.py collectstatic --no-input

echo "Aplicando migrações do banco de dados..."
python manage.py migrate
