import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from Mylivros.models import Livros

books = [
    {"name": "A coragem de ser imperfeito", "urlimagem": "https://m.media-amazon.com/images/I/51x5aXdYW-L._SY445_SX342_ML2_.jpg"},
    {"name": "Maestria", "urlimagem": "https://m.media-amazon.com/images/I/61GodKcYU3L._SY425_.jpg"},
    {"name": "O Poder do Hábito", "urlimagem": "https://m.media-amazon.com/images/I/815iPX0SgkL._SY425_.jpg"},
    {"name": "Hábitos Atômicos", "urlimagem": "https://m.media-amazon.com/images/I/713PN1USzXL._SY425_.jpg"},
    {"name": "O Mulato", "urlimagem": "https://m.media-amazon.com/images/I/318QZpujB8L._SY445_SX342_ML2_.jpg"},
    {"name": "Como Fazer Amigos e Influenciar Pessoas", "urlimagem": "https://m.media-amazon.com/images/I/71x-i7sKSvL._SY425_.jpg"},
    {"name": "Deep Work", "urlimagem": "https://m.media-amazon.com/images/I/51Cqo-5ErDL._SY445_SX342_ML2_.jpg"},
    {"name": "As Armas da Persuasão", "urlimagem": "https://m.media-amazon.com/images/I/41jMIhWS6gL._SY445_SX342_ML2_.jpg"},
    {"name": "Bom Demais para Ser Ignorado", "urlimagem": "https://m.media-amazon.com/images/I/71DrfyD70qL._SY425_.jpg"},
    {"name": "A Sutil Arte de Ligar o F*da-Se", "urlimagem": "https://m.media-amazon.com/images/I/6175IU0qFgL._SY425_.jpg"},
    {"name": "Noites Brancas", "urlimagem": "https://m.media-amazon.com/images/I/71F-Uf20+UL._SY425_.jpg"},
    {"name": "Por Lugares Incríveis", "urlimagem": "https://m.media-amazon.com/images/I/918Maoi6OML._SY425_.jpg"},
    {"name": "A cinco passos de você", "urlimagem": "https://m.media-amazon.com/images/I/81Q11TuUR3L._SY425_.jpg"},
    {"name": "As vantagens de ser invisível", "urlimagem": "https://m.media-amazon.com/images/I/81tJ71gMtpL._SY425_.jpg"},
]

for b in books:
    Livros.objects.get_or_create(
        name=b['name'], 
        defaults={
            'urlimagem': b['urlimagem'], 
            'description': 'Sem descrição', 
            'autor': 'Desconhecido', 
            'lido': True
        }
    )
print("Livros inseridos com sucesso!")
