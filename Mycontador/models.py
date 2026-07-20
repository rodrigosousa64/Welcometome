from django.db import models

# Create your models here.

class habitos(models.Model):
    Name = models.CharField(max_length=100)
    Description = models.CharField(max_length=100)
    startDate = models.DateField()

    def __str__(self):
        return self.Name
    
      