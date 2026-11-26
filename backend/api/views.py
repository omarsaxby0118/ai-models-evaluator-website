import csv
from collections import defaultdict

from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import AIModel, Evaluation
from .serializers import AIModelSerializer, EvaluationSerializer


@api_view(["GET"])
def health(request):
    """Simple endpoint the frontend uses to confirm the API is reachable."""
    return Response({"status": "ok", "time": timezone.now().isoformat()})


class AIModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AIModel.objects.filter(is_active=True)
    serializer_class = AIModelSerializer
    pagination_class = None


class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer

    def get_queryset(self):
        qs = Evaluation.objects.select_related("model_a", "model_b")
        model = self.request.query_params.get("model")
        if model:
            qs = qs.filter(Q(model_a__name=model) | Q(model_b__name=model))
        limit = self.request.query_params.get("limit")
        if limit and limit.isdigit() and self.action == "list":
            qs = qs[: int(limit)]
        return qs


EXPORT_FIELDS = [
    "id", "created_at", "prompt",
    "model_a", "response_a", "score_a",
    "model_b", "response_b", "score_b",
    "winner", "notes",
]


def export_evaluations(request):
    """Download every evaluation as CSV (opens in Excel / Google Sheets)."""
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="evaluations.csv"'
    response.write("﻿")  # BOM so Excel reads UTF-8 correctly
    writer = csv.writer(response)
    writer.writerow(EXPORT_FIELDS)
    for ev in Evaluation.objects.select_related("model_a", "model_b"):
        writer.writerow(
            [
                ev.id, ev.created_at.isoformat(), ev.prompt,
                ev.model_a.name, ev.response_a, ev.score_a,
                ev.model_b.name, ev.response_b, ev.score_b,
                ev.winner, ev.notes,
            ]
        )
    return response


@api_view(["GET"])
def leaderboard(request):
    """Win/loss/tie counts and average score per model, best first."""
    stats = defaultdict(lambda: {"wins": 0, "losses": 0, "ties": 0, "evaluations": 0, "scores": []})

    for ev in Evaluation.objects.select_related("model_a", "model_b"):
        for side, model, score in (("A", ev.model_a, ev.score_a), ("B", ev.model_b, ev.score_b)):
            row = stats[model.name]
            row["evaluations"] += 1
            if score is not None:
                row["scores"].append(score)
            if ev.winner == Evaluation.Winner.TIE:
                row["ties"] += 1
            elif ev.winner == side:
                row["wins"] += 1
            elif ev.winner:
                row["losses"] += 1

    rows = []
    for model in AIModel.objects.all():
        row = stats.get(model.name)
        if row is None and not model.is_active:
            continue
        row = row or {"wins": 0, "losses": 0, "ties": 0, "evaluations": 0, "scores": []}
        decided = row["wins"] + row["losses"] + row["ties"]
        scores = row.pop("scores")
        rows.append(
            {
                "model": model.name,
                **row,
                "win_rate": round(row["wins"] / decided, 3) if decided else None,
                "avg_score": round(sum(scores) / len(scores), 2) if scores else None,
            }
        )

    rows.sort(key=lambda r: (r["win_rate"] or 0, r["avg_score"] or 0, r["evaluations"]), reverse=True)
    return Response(rows)
