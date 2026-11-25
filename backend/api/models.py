from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class AIModel(models.Model):
    """A model that can be compared, e.g. "Claude" or "Codex"."""

    name = models.CharField(max_length=100, unique=True)
    provider = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "AI model"

    def __str__(self):
        return self.name


SCORE_VALIDATORS = [MinValueValidator(1), MaxValueValidator(10)]


class Evaluation(models.Model):
    """A side-by-side comparison of two model responses to the same prompt."""

    class Winner(models.TextChoices):
        A = "A", "Model A"
        B = "B", "Model B"
        TIE = "tie", "Tie"

    prompt = models.TextField()

    model_a = models.ForeignKey(AIModel, on_delete=models.PROTECT, related_name="+")
    response_a = models.TextField(blank=True)
    score_a = models.PositiveSmallIntegerField(null=True, blank=True, validators=SCORE_VALIDATORS)

    model_b = models.ForeignKey(AIModel, on_delete=models.PROTECT, related_name="+")
    response_b = models.TextField(blank=True)
    score_b = models.PositiveSmallIntegerField(null=True, blank=True, validators=SCORE_VALIDATORS)

    winner = models.CharField(max_length=3, choices=Winner.choices, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.model_a} vs {self.model_b}: {self.prompt[:40]}"
