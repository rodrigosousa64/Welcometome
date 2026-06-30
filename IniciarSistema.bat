@echo off
title MeuSistema
color 0A

echo =========================================
echo       INICIANDO O SISTEMA...
echo =========================================
echo.
echo Por favor, mantenha esta janela aberta enquanto estiver usando o sistema.
echo.

:: Chama o arquivo Python que nós criamos anteriormente
call venv\Scripts\python.exe iniciar.py
