from django.db import models
from datetime import timedelta
from django.utils import timezone

class Habitos(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    start_date = models.DateField()

    def __str__(self):
        return self.name

    @property
    def level(self) -> str:
        """Determines habit level directly from start_date without exposing raw day metrics."""
        days_active = (timezone.now().date() - self.start_date).days
        
        if days_active < 7:
            return "Level 1 (Initiate)"
        elif days_active < 21:
            return "Level 2 (Consistent)"
        elif days_active < 66:
            return "Level 3 (Mastered)"
        else:
            return "Level 4 (Elite)"
    
      
class Calendario(models.Model):
    nome = models.CharField(max_length=100) # Alterado de 'name' para 'nome'
    quantidade_semanas = models.IntegerField()
    data_inicio = models.DateField()
    data_fim = models.DateField(editable=False, null=True, blank=True)

    def __str__(self):
        return f"{self.nome} ({self.quantidade_semanas} semanas)"

    def save(self, *args, **kwargs):
        if self.data_inicio and self.quantidade_semanas is not None:
            self.data_fim = self.data_inicio + timedelta(weeks=self.quantidade_semanas)
        super().save(*args, **kwargs)

class Livros(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    urlimagem = models.URLField()    

    def __str__(self):
        return self.name