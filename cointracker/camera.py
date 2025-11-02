from __future__ import annotations

import random
from typing import List

from .schemas import RecognitionRequest, RecognitionResult


SAMPLE_MATCHES: List[str] = [
    "1912 French 1 Franc",
    "1957 Italian 100 Lire",
    "1969 German 5 Mark",
    "1901 US Morgan Dollar",
]


def recognize_currency(request: RecognitionRequest) -> RecognitionResult:
    """Return a placeholder recognition result.

    In a real mobile app this function would call into a computer vision
    pipeline. For the prototype we return a deterministic pseudo-random
    suggestion based on the filename to ensure repeatable responses.
    """

    seed = sum(ord(ch) for ch in request.filename)
    random.seed(seed)
    probable_match = random.choice(SAMPLE_MATCHES)
    confidence = random.uniform(0.4, 0.9)
    notes = (
        "Prototype vision pipeline placeholder. "
        "Integrate ML model or external service for production use."
    )
    return RecognitionResult(probable_match=probable_match, confidence=confidence, notes=notes)

