from django.db import models

# Create your models here.
class Livros(models.Model):
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=100)
    autor = models.CharField(max_length=100)
    urlimagem = models.URLField()  
    lido = models.BooleanField(default=False)
    data_leitura = models.DateField(null=True, blank=True)  

    def __str__(self):
        return self.name