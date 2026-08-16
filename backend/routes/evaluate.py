from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.evaluation.qa_eval import BusinessInsightEvaluator

router = APIRouter()

# Shared evaluator — history accumulates for the lifetime of the process
_evaluator = BusinessInsightEvaluator()


class EvaluateRequest(BaseModel):
    question: str
    answer: str
    ground_truth: str


@router.post("/api/evaluate")
async def evaluate_response(req: EvaluateRequest):
    """
    QAEvalChain-style evaluation.
    Scores the AI answer against the ground truth on 4 dimensions (1-5 each).
    """
    if not req.question.strip() or not req.answer.strip() or not req.ground_truth.strip():
        raise HTTPException(status_code=422, detail="question, answer, and ground_truth are all required")

    try:
        result = await _evaluator.evaluate_response(
            question=req.question,
            answer=req.answer,
            ground_truth=req.ground_truth,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation error: {str(e)}")


@router.get("/api/evaluate/history")
def evaluation_history():
    """Return all past evaluation scores and running averages."""
    history = [
        {k: v for k, v in m.items() if k != "raw_output"}
        for m in _evaluator.metrics_history
    ]
    return {
        "summary": _evaluator.get_quality_summary(),
        "history": history,
    }
