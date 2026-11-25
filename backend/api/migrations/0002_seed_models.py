from django.db import migrations

SEED = [("Claude", "Anthropic"), ("Codex", "OpenAI")]


def seed(apps, schema_editor):
    AIModel = apps.get_model("api", "AIModel")
    for name, provider in SEED:
        AIModel.objects.get_or_create(name=name, defaults={"provider": provider})


def unseed(apps, schema_editor):
    AIModel = apps.get_model("api", "AIModel")
    Evaluation = apps.get_model("api", "Evaluation")
    used = set(Evaluation.objects.values_list("model_a", flat=True)) | set(
        Evaluation.objects.values_list("model_b", flat=True)
    )
    AIModel.objects.filter(name__in=[n for n, _ in SEED]).exclude(pk__in=used).delete()


class Migration(migrations.Migration):
    dependencies = [("api", "0001_initial")]

    operations = [migrations.RunPython(seed, unseed)]
