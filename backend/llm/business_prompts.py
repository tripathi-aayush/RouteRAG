from typing import List, Dict
from langchain_core.prompts import PromptTemplate

METRIC_ANALYSIS_TEMPLATE = """You are a business intelligence expert analyzing data metrics.

Available Metrics:
{context}

User Question: {question}

Previous Conversation:
{chat_history}

Provide a detailed analysis following these guidelines:
1. Focus on the specific metrics relevant to the question
2. Identify key trends, patterns, or anomalies
3. Provide actionable insights based on the data
4. Highlight statistical significance where applicable
5. Suggest potential business implications

Your analysis should be:
- Data-driven and specific
- Business-focused and actionable
- Clear and concise
- Backed by numbers and trends

Response Format:
1. Key Findings: [List 2-3 main insights]
2. Detailed Analysis: [In-depth explanation]
3. Business Implications: [What this means for the business]
4. Recommendations: [Specific, actionable steps]

Response:"""

VISUALIZATION_RECOMMENDATION_TEMPLATE = """Based on the analysis of these metrics:
{metrics}

And the user's question:
{question}

Recommend the most appropriate visualization(s) that would best communicate these insights.

Consider:
1. The type of data (temporal, categorical, numerical)
2. The relationships we want to highlight
3. The key message we want to convey
4. The ease of interpretation for business users

Provide your recommendation in this format:
1. Primary Visualization: [Type] + [Justification]
2. Optional Secondary Visualization: [Type] + [Justification]
3. Key Elements to Include: [List of important components]

Chart Specification:"""

class BusinessPromptManager:
    def __init__(self):
        self.analysis_prompt = PromptTemplate(
            template=METRIC_ANALYSIS_TEMPLATE,
            input_variables=["context", "question", "chat_history"]
        )

        self.visualization_prompt = PromptTemplate(
            template=VISUALIZATION_RECOMMENDATION_TEMPLATE,
            input_variables=["metrics", "question"]
        )

    def get_analysis_prompt(self, context: str, question: str, chat_history: List[str]) -> str:
        """Generate analysis prompt with context and history."""
        return self.analysis_prompt.format(
            context=context,
            question=question,
            chat_history="\n".join(chat_history)
        )

    def get_visualization_prompt(self, metrics: Dict, question: str) -> str:
        """Generate visualization recommendation prompt."""
        metrics_text = "\n".join([f"{k}: {v}" for k, v in metrics.items()])
        return self.visualization_prompt.format(
            metrics=metrics_text,
            question=question
        )