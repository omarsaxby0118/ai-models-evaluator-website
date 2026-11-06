from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def health(request):
    """Simple endpoint the frontend uses to confirm the API is reachable."""
    return Response({"status": "ok", "time": timezone.now().isoformat()})
