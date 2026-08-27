from django.db import models
from datetime import timedelta
from django.db.models.signals import post_save
from django.dispatch import receiver

class Calendario(models.Model):
    nome = models.CharField(max_length=100) # Alterado de 'name' para 'nome'
    quantidade_semanas = models.IntegerField()
    data_inicio = models.DateField()
    data_fim = models.DateField(editable=False, null=True, blank=True)
    block_theme = models.CharField(max_length=200, blank=True, null=True, help_text="Objetivo principal das 12 semanas")

    def __str__(self):
        return f"{self.nome} ({self.quantidade_semanas} semanas)"

    def save(self, *args, **kwargs):
        if self.data_inicio and self.quantidade_semanas is not None:
            self.data_fim = self.data_inicio + timedelta(weeks=self.quantidade_semanas)
        super().save(*args, **kwargs)

class CalendarioSemana(models.Model):
    calendario = models.ForeignKey(Calendario, on_delete=models.CASCADE, related_name='semanas')
    numero_semana = models.IntegerField()
    week_title = models.CharField(max_length=100, blank=True, null=True, help_text="Ex: Fim do Senac")
    main_objective = models.TextField(blank=True, null=True, help_text="Micro-objetivo da semana")
    is_milestone = models.BooleanField(default=False)

    def __str__(self):
        return f"Semana {self.numero_semana} - {self.calendario.nome}"

@receiver(post_save, sender=Calendario)
def criar_semanas_calendario(sender, instance, created, **kwargs):
    if created or instance.semanas.count() == 0:
        for i in range(1, instance.quantidade_semanas + 1):
            CalendarioSemana.objects.get_or_create(
                calendario=instance,
                numero_semana=i
            )
