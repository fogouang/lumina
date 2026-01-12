"""
Module exam attempts.
"""

from app.modules.exam_attempts.controller import router as exam_attempts_router
from app.modules.exam_attempts.service import ExamAttemptService

__all__ = ["exam_attempts_router", "ExamAttemptService"]