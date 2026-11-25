from django.contrib import admin

from .models import AIModel, Evaluation


@admin.register(AIModel)
class AIModelAdmin(admin.ModelAdmin):
    list_display = ["name", "provider", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name", "provider"]


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ["id", "model_a", "score_a", "model_b", "score_b", "winner", "created_at"]
    list_filter = ["winner", "model_a", "model_b"]
    search_fields = ["prompt", "notes"]
