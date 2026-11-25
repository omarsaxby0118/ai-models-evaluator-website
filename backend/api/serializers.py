from rest_framework import serializers

from .models import AIModel, Evaluation


class AIModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModel
        fields = ["id", "name", "provider"]


class EvaluationSerializer(serializers.ModelSerializer):
    model_a = serializers.SlugRelatedField(
        slug_field="name", queryset=AIModel.objects.filter(is_active=True)
    )
    model_b = serializers.SlugRelatedField(
        slug_field="name", queryset=AIModel.objects.filter(is_active=True)
    )

    class Meta:
        model = Evaluation
        fields = [
            "id",
            "prompt",
            "model_a",
            "response_a",
            "score_a",
            "model_b",
            "response_b",
            "score_b",
            "winner",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_prompt(self, value):
        if not value.strip():
            raise serializers.ValidationError("Prompt cannot be empty.")
        return value

    def validate(self, attrs):
        model_a = attrs.get("model_a", getattr(self.instance, "model_a", None))
        model_b = attrs.get("model_b", getattr(self.instance, "model_b", None))
        if model_a is not None and model_a == model_b:
            raise serializers.ValidationError({"model_b": "Pick two different models."})
        return attrs
