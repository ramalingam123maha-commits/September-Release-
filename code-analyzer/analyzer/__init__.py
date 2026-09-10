"""Intelligent Code Analysis System"""

__version__ = "1.0.0"

from .core import CodeAnalyzer
from .models import AnalysisResult, CodeMetrics

__all__ = [
    "CodeAnalyzer",
    "AnalysisResult",
    "CodeMetrics",
]
