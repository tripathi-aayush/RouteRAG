from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.agents import Tool

# Analysis prompts
TREND_ANALYSIS_PROMPT = """Analyze the following business data for trends and patterns:

Data:
{data}

Focus on:
1. Time-based patterns
2. Significant changes
3. Correlations between metrics
4. Anomalies or outliers
5. Growth opportunities

Context from previous analysis:
{context}

Question: {question}

Provide a detailed analysis with specific insights and recommendations.
"""

SEGMENTATION_PROMPT = """Perform customer segmentation analysis on the following data:

Data:
{data}

Consider:
1. Demographics
2. Purchase behavior
3. Product preferences
4. Regional patterns
5. Value segments

Previous insights:
{context}

Question: {question}

Provide detailed segmentation insights and targeting recommendations.
"""

METRIC_ANALYSIS_PROMPT = """Analyze the following business metrics:

Data:
{data}

Calculate and analyze:
1. Key statistical measures
2. Performance indicators
3. Growth rates
4. Variance analysis
5. Benchmark comparisons

Previous context:
{context}

Question: {question}

Provide detailed metric analysis with business implications.
"""

class BusinessAnalysisChain:
    def __init__(self, llm):
        self.llm = llm
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )

        # Initialize analysis chains
        self.trend_chain = LLMChain(
            llm=llm,
            prompt=PromptTemplate(
                input_variables=["data", "context", "question"],
                template=TREND_ANALYSIS_PROMPT
            ),
            memory=self.memory,
            verbose=True
        )

        self.segmentation_chain = LLMChain(
            llm=llm,
            prompt=PromptTemplate(
                input_variables=["data", "context", "question"],
                template=SEGMENTATION_PROMPT
            ),
            memory=self.memory,
            verbose=True
        )

        self.metric_chain = LLMChain(
            llm=llm,
            prompt=PromptTemplate(
                input_variables=["data", "context", "question"],
                template=METRIC_ANALYSIS_PROMPT
            ),
            memory=self.memory,
            verbose=True
        )

        # Define analysis tools
        self.tools = [
            Tool(
                name="TrendAnalysis",
                func=self.trend_chain.run,
                description="Analyze business trends and patterns"
            ),
            Tool(
                name="CustomerSegmentation",
                func=self.segmentation_chain.run,
                description="Perform customer segmentation analysis"
            ),
            Tool(
                name="MetricAnalysis",
                func=self.metric_chain.run,
                description="Analyze business metrics and KPIs"
            )
        ]

    async def analyze(self, data, question, context=None):
        """Run appropriate analysis based on question type."""
        # Determine analysis type
        if any(word in question.lower() for word in ["trend", "pattern", "change", "over time"]):
            result = await self.trend_chain.arun(data=data, context=context or "", question=question)
        elif any(word in question.lower() for word in ["segment", "customer", "demographic"]):
            result = await self.segmentation_chain.arun(data=data, context=context or "", question=question)
        elif any(word in question.lower() for word in ["metric", "kpi", "measure", "performance"]):
            result = await self.metric_chain.arun(data=data, context=context or "", question=question)
        else:
            # Default to trend analysis
            result = await self.trend_chain.arun(data=data, context=context or "", question=question)

        return {
            "analysis": result,
            "metrics_used": self._extract_metrics(result),
            "recommendations": self._extract_recommendations(result)
        }

    def _extract_metrics(self, analysis):
        """Extract key metrics mentioned in the analysis."""
        # Implementation would identify and extract metrics
        return []

    def _extract_recommendations(self, analysis):
        """Extract actionable recommendations from the analysis."""
        # Implementation would identify and extract recommendations
        return []