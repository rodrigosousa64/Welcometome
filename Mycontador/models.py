from django.db import models
from datetime import timedelta
# Create your models here.

class habitos(models.Model):
    Name = models.CharField(max_length=100)
    Description = models.CharField(max_length=100)
    startDate = models.DateField()

    def __str__(self):
        return self.Name
    
      
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