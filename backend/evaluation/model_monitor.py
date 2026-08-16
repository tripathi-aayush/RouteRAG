from typing import Dict, List, Any
import os
import pandas as pd
from datetime import datetime
from langchain.evaluation import QAEvalChain, StringEvaluator
from langchain_google_genai import ChatGoogleGenerativeAI
import numpy as np

class ModelMonitor:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash-lite",
            temperature=0,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        self.qa_chain = QAEvalChain.from_llm(llm=self.llm)
        self.evaluator = StringEvaluator()
        self.metrics_history = []
        self.feedback_history = []

    def evaluate_response(self, question: str, answer: str,
                        ground_truth: str = None) -> Dict[str, Any]:
        """Evaluate a model response."""
        evaluation = {}

        # Coherence and relevance check
        coherence_score = self._evaluate_coherence(question, answer)
        evaluation["coherence"] = coherence_score

        # Business value assessment
        business_value = self._assess_business_value(question, answer)
        evaluation["business_value"] = business_value

        # Factual accuracy (if ground truth available)
        if ground_truth:
            accuracy = self._evaluate_accuracy(answer, ground_truth)
            evaluation["accuracy"] = accuracy

        # Response quality metrics
        quality_metrics = self._evaluate_quality(answer)
        evaluation.update(quality_metrics)

        # Store evaluation
        self._store_evaluation(question, answer, evaluation)

        return evaluation

    def _evaluate_coherence(self, question: str, answer: str) -> float:
        """Evaluate response coherence and relevance."""
        coherence_prompt = f"""Rate the coherence and relevance of this response:

Question: {question}
Response: {answer}

Consider:
1. Does the response directly address the question?
2. Is the response well-structured and logical?
3. Are the points connected meaningfully?
4. Is the language clear and professional?

Rate from 0.0 to 1.0:"""

        result = self.llm.predict(coherence_prompt)
        try:
            score = float(result.strip())
            return min(max(score, 0.0), 1.0)
        except ValueError:
            return 0.5

    def _assess_business_value(self, question: str, answer: str) -> Dict[str, float]:
        """Assess the business value of the response."""
        value_prompt = f"""Assess the business value of this response:

Question: {question}
Response: {answer}

Rate each aspect from 0.0 to 1.0:
1. Actionability - Are there clear, implementable recommendations?
2. Insight Quality - Does it provide valuable business insights?
3. Data Usage - Does it effectively use available data?
4. Strategic Value - Does it support strategic decision-making?

Provide ratings:"""

        result = self.llm.predict(value_prompt)
        try:
            lines = result.strip().split('\n')
            ratings = {}
            for line in lines:
                if ':' in line:
                    key, value = line.split(':')
                    ratings[key.strip()] = float(value.strip())
            return ratings
        except Exception:
            return {
                "actionability": 0.5,
                "insight_quality": 0.5,
                "data_usage": 0.5,
                "strategic_value": 0.5
            }

    def _evaluate_accuracy(self, answer: str, ground_truth: str) -> float:
        """Evaluate factual accuracy against ground truth."""
        eval_result = self.qa_chain.evaluate(
            prediction=answer,
            reference=ground_truth
        )
        return float(eval_result.get("score", 0.5))

    def _evaluate_quality(self, answer: str) -> Dict[str, Any]:
        """Evaluate general response quality metrics."""
        return {
            "length": len(answer),
            "num_sentences": len(answer.split('.')),
            "has_numbers": bool(any(c.isdigit() for c in answer)),
            "has_recommendations": "recommend" in answer.lower()
        }

    def _store_evaluation(self, question: str, answer: str,
                         evaluation: Dict[str, Any]) -> None:
        """Store evaluation results for monitoring."""
        timestamp = datetime.now()
        eval_record = {
            "timestamp": timestamp,
            "question": question,
            "answer": answer,
            "metrics": evaluation
        }
        self.metrics_history.append(eval_record)

    def add_feedback(self, question: str, answer: str,
                    feedback: Dict[str, Any]) -> None:
        """Add user feedback for a response."""
        timestamp = datetime.now()
        feedback_record = {
            "timestamp": timestamp,
            "question": question,
            "answer": answer,
            "feedback": feedback
        }
        self.feedback_history.append(feedback_record)

    def get_performance_metrics(self, time_range: str = "all") -> Dict[str, Any]:
        """Get aggregated performance metrics."""
        df = pd.DataFrame([
            {
                "timestamp": record["timestamp"],
                "coherence": record["metrics"]["coherence"],
                **record["metrics"].get("business_value", {})
            }
            for record in self.metrics_history
        ])

        if time_range != "all":
            # Filter by time range
            pass

        metrics = {
            "average_coherence": float(df["coherence"].mean()),
            "coherence_trend": df["coherence"].rolling(10).mean().tolist(),
            "business_value_metrics": {
                col: float(df[col].mean())
                for col in ["actionability", "insight_quality",
                          "data_usage", "strategic_value"]
                if col in df.columns
            }
        }

        return metrics

    def get_quality_summary(self) -> Dict[str, Any]:
        """Get summary of response quality metrics."""
        recent_metrics = self.metrics_history[-100:]  # Last 100 responses

        quality_scores = []
        for record in recent_metrics:
            metrics = record["metrics"]
            score = np.mean([
                metrics["coherence"],
                *metrics.get("business_value", {}).values()
            ])
            quality_scores.append(score)

        return {
            "average_quality": float(np.mean(quality_scores)),
            "quality_std": float(np.std(quality_scores)),
            "trend": list(pd.Series(quality_scores).rolling(10).mean())
        }