#!/usr/bin/env bash
# Saia em caso de erro
set -o errexit

# Verifica se o NPM não existe no ambiente e instala o Node via NVM
if ! command -v npm &> /dev/null
then
    echo "NPM não encontrado pelo builder. Instalando Node via NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Carrega o nvm
    nvm install 20
    nvm use 20
fi

echo "Instalando dependências e realizando build do Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Instalando dependências do Backend..."
cd backend
pip install -r ../requirements.txt

echo "Coletando arquivos estáticos..."
python manage.py collectstatic --no-input

echo "Aplicando migrações do banco de dados..."
python manage.py migrate
