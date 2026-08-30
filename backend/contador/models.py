from django.db import models
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
    
