import os
import pandas as pd
import re
from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

# QAEvalChain-equivalent prompt — same evaluation criteria, direct LLM call
EVAL_PROMPT = """You are an expert evaluator for a business intelligence AI assistant.

Evaluate the AI's answer against the ground truth for the question below.

Question: {question}
AI Answer: {answer}
Ground Truth: {ground_truth}

Score each dimension from 1 (poor) to 5 (excellent).

Respond in EXACTLY this format with no extra text:
Accuracy: <number>
Completeness: <number>
Relevance: <number>
Business Value: <number>
Overall Feedback: <one sentence>
"""


class BusinessInsightEvaluator:
    """
    Evaluates AI responses using a QAEvalChain-style prompt sent directly
    via ChatGoogleGenerativeAI (gemini-1.5-flash) with temperature=0 for consistent scoring.
    """

    def __init__(self, llm=None):
        self._llm = llm
        self.metrics_history: List[Dict[str, Any]] = []

    @property
    def llm(self):
        if self._llm is None:
            key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
            self._llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                temperature=0,
                google_api_key=key
            )
        return self._llm

    async def evaluate_response(self, question: str, answer: str, ground_truth: str) -> Dict[str, Any]:
        """Run QAEvalChain-style evaluation and return scored metrics."""
        prompt = EVAL_PROMPT.format(
            question=question,
            answer=answer,
            ground_truth=ground_truth,
        )

        messages = [
            SystemMessage(content="You are a strict, concise model evaluator. Follow the output format exactly."),
            HumanMessage(content=prompt),
        ]
        response = await self.llm.ainvoke(messages)
        raw_text = response.content if hasattr(response, "content") else str(response)
        metrics = self._parse_metrics(raw_text)
        metrics["raw_output"] = raw_text
        self.metrics_history.append(metrics)

        return {
            "metrics": metrics,
            "feedback": self._generate_feedback(metrics),
            "improvement_areas": self._identify_improvements(metrics),
        }

    def _parse_metrics(self, eval_result: str) -> Dict[str, Any]:
        """Extract numeric scores from the LLM eval output."""
        keys = {
            "accuracy":       r"accuracy\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?)",
            "completeness":   r"completeness\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?)",
            "relevance":      r"relevance\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?)",
            "business_value": r"business\s*value\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?)",
        }
        scores: Dict[str, Any] = {}
        text = eval_result.lower()
        for metric, pattern in keys.items():
            match = re.search(pattern, text)
            if match:
                raw = float(match.group(1))
                # Normalise: if score looks like it's on 1-5 scale keep as-is;
                # if somehow 0-1 scale multiply by 5
                scores[metric] = round(raw if raw > 1.0 else raw * 5, 2)
            else:
                scores[metric] = 0.0

        # Extract overall feedback line
        fb_match = re.search(r"overall feedback\s*[:\-]\s*(.+)", eval_result, re.IGNORECASE)
        scores["overall_feedback"] = fb_match.group(1).strip() if fb_match else ""

        return scores

    def _generate_feedback(self, metrics: Dict[str, Any]) -> str:
        """Generate feedback based on evaluation metrics."""
        feedback = []
        if metrics.get("accuracy", 5) < 4.0:
            feedback.append("Improve factual accuracy")
        if metrics.get("completeness", 5) < 4.0:
            feedback.append("Include more comprehensive analysis")
        if metrics.get("relevance", 5) < 4.0:
            feedback.append("Focus more on relevant business insights")
        if metrics.get("business_value", 5) < 4.0:
            feedback.append("Enhance actionable recommendations")
        return "; ".join(feedback) if feedback else "Response meets quality standards"

    def _identify_improvements(self, metrics: Dict[str, Any]) -> List[str]:
        """Identify areas for improvement based on metrics."""
        improvements = []
        if metrics.get("accuracy", 5) < 3.0:
            improvements.append("Verify data sources and calculations")
        if metrics.get("completeness", 5) < 3.0:
            improvements.append("Add missing context and analysis")
        if metrics.get("relevance", 5) < 3.0:
            improvements.append("Better align with business context")
        if metrics.get("business_value", 5) < 3.0:
            improvements.append("Include more actionable insights")
        return improvements

    def get_performance_metrics(self) -> pd.DataFrame:
        """Get historical performance metrics as a DataFrame."""
        if not self.metrics_history:
            return pd.DataFrame()
        rows = [
            {k: v for k, v in m.items() if k not in ("raw_output", "overall_feedback")}
            for m in self.metrics_history
        ]
        return pd.DataFrame(rows)

    def get_quality_summary(self) -> Dict[str, float]:
        """Get average scores across all evaluations."""
        if not self.metrics_history:
            return {}
        df = self.get_performance_metrics()
        return {
            "average_accuracy":       round(float(df["accuracy"].mean()), 2),
            "average_completeness":   round(float(df["completeness"].mean()), 2),
            "average_relevance":      round(float(df["relevance"].mean()), 2),
            "average_business_value": round(float(df["business_value"].mean()), 2),
            "total_evaluations":      len(self.metrics_history),
        }