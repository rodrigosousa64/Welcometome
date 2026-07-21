# 🏠 Welcometome

> Portfólio pessoal + painel de administração de hábitos, construído com **Django 6** e uma camada frontend modular em JavaScript puro.

---

## 📌 Sobre o projeto

O **Welcometome** nasceu como um portfólio, mas cresceu para um **hub pessoal de produtividade**. Além de apresentar meus projetos ao mundo, ele funciona como uma ferramenta de autogestão onde acompanho hábitos, visualizo minha atividade no GitHub e organizo minhas leituras — tudo em um único lugar, rodando localmente ou na nuvem.

---

## ✨ Funcionalidades

### 📊 Painel Pessoal (`/pessoal/`)
Dashboard principal com múltiplas seções:

| Seção | Descrição |
|---|---|
| **Header** | Saudação personalizada com data e hora em tempo real |
| **GitHub Streak** | Busca via GraphQL API o streak atual de contribuições |
| **Pódio de Hábitos** | Ranking visual dos hábitos com maior sequência ativa |
| **Calendário de Hábitos** | Visualização estilo "GitHub contributions" para cada hábito |
| **Lista de Hábitos** | Cards com nome, descrição e data de início de cada hábito |

### 📚 Livros (`/livros/`)
Seção dedicada ao registro de leituras e livros que estou acompanhando.

### 🏡 Home (`/`)
Página inicial do portfólio com dados de GitHub streak integrados.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Backend** | Django 6.0.6 (Python) |
| **Banco de Dados** | SQLite (dev) |
| **Frontend** | HTML5 + CSS3 + JavaScript Vanilla |
| **API GitHub** | GitHub GraphQL API v4 |
| **Fontes** | Google Fonts — Inter + JetBrains Mono |
| **Deploy** | Procfile (compatível com Heroku/Railway) |

---

## 🏗️ Arquitetura do Projeto

```
Welcometome/
├── core/                        # Configurações Django (settings, urls raiz)
├── home/                        # App da página inicial
│   ├── gitofensive.py           # Módulo de integração com GitHub GraphQL API
│   └── templates/home.html
├── Mycontador/                  # App do painel pessoal (hábitos + streak)
│   ├── models.py                # Model: habitos (Name, Description, startDate)
│   ├── views.py                 # Views: github_streak, aniversario, api_habitos
│   ├── urls.py                  # Rotas do painel
│   ├── templates/Mycontador/
│   │   ├── github_streak.html   # Template principal do dashboard
│   │   └── partials/            # Componentes HTML modulares
│   │       ├── header-section.html
│   │       ├── podium-section.html
│   │       ├── habitos-section.html
│   │       └── calendar-section.html
│   └── static/Mycontador/
│       ├── css/                 # Estilos por seção (modular)
│       │   ├── github_streak.css
│       │   ├── dashboard-grid.css
│       │   ├── header-section.css
│       │   ├── podium-section.css
│       │   ├── calendar-section.css
│       │   ├── habitos-section.css
│       │   └── analytics.css
│       └── js/                  # Scripts por seção (modular)
│           ├── header-section.js
│           ├── podium.js
│           ├── calendar-section.js
│           ├── habitos-section.js
│           └── aniversario.js
├── Mylivros/                    # App de registro de livros
├── static/                      # Arquivos estáticos globais
├── templates/                   # Templates base globais
├── IniciarSistema.bat           # Script de inicialização rápida (Windows)
├── Iniciar_Completo.bat         # Script de inicialização completa (Windows)
└── requirements.txt
```

---

## 🔌 API Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/pessoal/` | Dashboard principal |
| `GET` | `/pessoal/api/habitos/` | Lista todos os hábitos como JSON |
| `GET` | `/pessoal/aniversario/` | Página de aniversário |
| `GET` | `/livros/` | Lista de livros |
| `GET` | `/` | Página inicial (portfólio) |

---

## ⚙️ Como rodar localmente

### Pré-requisitos
- Python 3.10+
- Git

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/rodrigosousa64/Welcometome.git
cd Welcometome

# 2. Crie e ative o ambiente virtual
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Configure as variáveis de ambiente
# Crie um arquivo .env na raiz do projeto:
```

```env
SECRET_KEY=sua_secret_key_aqui
GITHUB_TOKEN=seu_token_do_github
GITHUB_USERNAME=seu_usuario_do_github
```

```bash
# 5. Rode as migrations
python manage.py migrate

# 6. (Opcional) Crie um superusuário para gerenciar hábitos pelo admin
python manage.py createsuperuser

# 7. Inicie o servidor
python manage.py runserver
```

Acesse: **http://127.0.0.1:8000**

> 💡 **Atalho Windows**: use `IniciarSistema.bat` ou `Iniciar_Completo.bat` para iniciar com um duplo clique.

---

## 🧠 Módulo `gitofensive.py`

O coração da integração com o GitHub. Realiza uma query **GraphQL** diretamente na API v4 do GitHub para buscar o histórico de contribuições e calcular:

- **`current_streak`**: dias consecutivos com pelo menos 1 commit até hoje
- **`max_streak`**: maior sequência de commits registrada no ano

A lógica é tolerante ao dia atual — se você ainda não commitou hoje mas estava ativo ontem, o streak não é zerado prematuramente.

---

## 📦 Gerenciando Hábitos

Os hábitos são gerenciados pelo **Django Admin** em `/admin/`. Cada hábito possui:

| Campo | Tipo | Descrição |
|---|---|---|
| `Name` | `CharField` | Nome do hábito |
| `Description` | `CharField` | Descrição curta |
| `startDate` | `DateField` | Data de início (usada para calcular a sequência) |

O frontend consome os dados via API REST (`/pessoal/api/habitos/`) e renderiza o calendário de forma dinâmica, calculando o streak de cada hábito no lado do cliente com base na `startDate`.

---

## 🚀 Deploy

O projeto inclui um `Procfile` pronto para plataformas como **Heroku** ou **Railway**:

```
web: gunicorn core.wsgi
```

Lembre-se de configurar as variáveis de ambiente (`SECRET_KEY`, `GITHUB_TOKEN`, `GITHUB_USERNAME`) no painel da plataforma escolhida.

---

## 👤 Autor

**Rodrigo Sousa**
- GitHub: [@rodrigosousa64](https://github.com/rodrigosousa64)

---

*Projeto em constante evolução — novas seções e funcionalidades são adicionadas conforme os hábitos mudam.* 🌱
