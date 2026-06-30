@echo off
title Instalador e Inicializador do Sistema
color 0A

echo ===================================================
echo   Verificando dependencias do sistema...
echo ===================================================

python --version >nul 2>&1
IF %ERRORLEVEL% EQU 0 GOTO PYTHON_INSTALADO

echo [!] Python nao encontrado no sistema!
echo [i] Baixando o instalador do Python do site oficial...
curl -o python_installer.exe https://www.python.org/ftp/python/3.12.4/python-3.12.4-amd64.exe

echo [i] Instalando o Python silenciosamente (isso pode demorar 1 minutinho)...
start /wait python_installer.exe /quiet InstallAllUsers=0 PrependPath=1 Include_test=0

echo [i] Python instalado com sucesso! Limpando o instalador...
del python_installer.exe

echo.
echo ===================================================
echo [ATENCAO] O Python acabou de ser instalado!
echo O Windows precisa atualizar as configuracoes.
echo Por favor, feche esta janela e de dois cliques
echo neste arquivo novamente para abrir o sistema.
echo ===================================================
pause
exit

:PYTHON_INSTALADO
echo [OK] Python ja esta instalado!
echo.
echo ===================================================
echo   Verificando Ambiente Virtual...
echo ===================================================

IF EXIST "venv\Scripts\python.exe" GOTO AMBIENTE_CONFIGURADO

echo [i] Ambiente do sistema nao encontrado. Configurando agora...
python -m venv venv

echo [i] Instalando as bibliotecas necessarias do projeto...
call venv\Scripts\python.exe -m pip install --upgrade pip >nul 2>&1

IF NOT EXIST "requirements.txt" GOTO SEM_REQUIREMENTS
call venv\Scripts\python.exe -m pip install -r requirements.txt
GOTO FIM_INSTALACAO

:SEM_REQUIREMENTS
echo [!] Arquivo requirements.txt nao encontrado! O sistema pode nao funcionar.

:FIM_INSTALACAO
echo [OK] Bibliotecas instaladas!
GOTO INICIAR_SISTEMA

:AMBIENTE_CONFIGURADO
echo [OK] Ambiente do sistema ja esta configurado!

:INICIAR_SISTEMA
echo.
echo ===================================================
echo   INICIANDO O SISTEMA...
echo ===================================================

call venv\Scripts\python.exe iniciar.py

pause
