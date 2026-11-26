import csv
import io

from django.test import TestCase
from django.urls import reverse

from .models import AIModel, Evaluation


class HealthTests(TestCase):
    def test_health_ok(self):
        response = self.client.get(reverse("health"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")


class ModelsTests(TestCase):
    def test_seeded_models_listed(self):
        names = [m["name"] for m in self.client.get(reverse("aimodel-list")).json()]
        self.assertIn("Claude", names)
        self.assertIn("Codex", names)

    def test_inactive_models_hidden(self):
        AIModel.objects.create(name="Retired", is_active=False)
        names = [m["name"] for m in self.client.get(reverse("aimodel-list")).json()]
        self.assertNotIn("Retired", names)


class EvaluationTests(TestCase):
    def payload(self, **overrides):
        data = {
            "prompt": "Write a function that reverses a string.",
            "model_a": "Codex",
            "response_a": "def rev(s): return s[::-1]",
            "score_a": 7,
            "model_b": "Claude",
            "response_b": "def reverse(s: str) -> str:\n    return s[::-1]",
            "score_b": 9,
            "winner": "B",
        }
        data.update(overrides)
        return data

    def post(self, **overrides):
        return self.client.post(
            reverse("evaluation-list"), self.payload(**overrides), content_type="application/json"
        )

    def test_create_and_list(self):
        response = self.post()
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.json()["model_b"], "Claude")
        listed = self.client.get(reverse("evaluation-list")).json()
        self.assertEqual(len(listed), 1)

    def test_rejects_same_model_twice(self):
        response = self.post(model_b="Codex")
        self.assertEqual(response.status_code, 400)
        self.assertIn("model_b", response.json())

    def test_rejects_blank_prompt_and_bad_score(self):
        response = self.post(prompt="   ", score_a=11)
        self.assertEqual(response.status_code, 400)
        self.assertIn("prompt", response.json())
        self.assertIn("score_a", response.json())

    def test_rejects_unknown_model(self):
        self.assertEqual(self.post(model_a="Nope").status_code, 400)

    def test_filter_limit_and_delete(self):
        self.post()
        self.post()
        self.assertEqual(len(self.client.get(reverse("evaluation-list") + "?limit=1").json()), 1)
        self.assertEqual(len(self.client.get(reverse("evaluation-list") + "?model=Claude").json()), 2)
        ev = Evaluation.objects.first()
        response = self.client.delete(reverse("evaluation-detail", args=[ev.id]))
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Evaluation.objects.count(), 1)


class ExportTests(TestCase):
    def test_csv_export(self):
        codex = AIModel.objects.get(name="Codex")
        claude = AIModel.objects.get(name="Claude")
        Evaluation.objects.create(
            prompt='Multi-line, "quoted"\nprompt', model_a=codex, model_b=claude, winner="B", score_b=9
        )
        response = self.client.get(reverse("evaluation-export"))
        self.assertEqual(response.status_code, 200)
        self.assertIn("attachment", response["Content-Disposition"])
        rows = list(csv.reader(io.StringIO(response.content.decode("utf-8-sig"))))
        self.assertEqual(rows[0][:3], ["id", "created_at", "prompt"])
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[1][2], 'Multi-line, "quoted"\nprompt')
        self.assertEqual(rows[1][3], "Codex")
        self.assertEqual(rows[1][9], "B")


class LeaderboardTests(TestCase):
    def test_counts_wins_losses_ties_and_scores(self):
        codex = AIModel.objects.get(name="Codex")
        claude = AIModel.objects.get(name="Claude")
        Evaluation.objects.create(prompt="p1", model_a=codex, model_b=claude, winner="B", score_a=4, score_b=8)
        Evaluation.objects.create(prompt="p2", model_a=claude, model_b=codex, winner="tie", score_a=6)
        Evaluation.objects.create(prompt="p3", model_a=codex, model_b=claude)  # undecided

        rows = {r["model"]: r for r in self.client.get(reverse("leaderboard")).json()}
        self.assertEqual(rows["Claude"]["wins"], 1)
        self.assertEqual(rows["Claude"]["ties"], 1)
        self.assertEqual(rows["Claude"]["evaluations"], 3)
        self.assertEqual(rows["Claude"]["win_rate"], 0.5)
        self.assertEqual(rows["Claude"]["avg_score"], 7.0)
        self.assertEqual(rows["Codex"]["losses"], 1)
        self.assertEqual(rows["Codex"]["avg_score"], 4.0)
        first = self.client.get(reverse("leaderboard")).json()[0]
        self.assertEqual(first["model"], "Claude")
