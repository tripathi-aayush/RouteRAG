from typing import Dict, List, Any
import os
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain.tools import BaseTool

def create_analysis_agent(tools: List[BaseTool]):
    """Create an agent for business analysis."""
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content="You are a business intelligence analyst. Use tools to analyze data and provide insights."),
        MessagesPlaceholder(variable_name="chat_history"),
        HumanMessage(content="{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    llm = ChatGoogleGenerativeAI(
        model="gemini-3.5-flash-lite",
        temperature=0.2,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    # Placeholder for agent pipeline if invoked
    return {
        "llm": llm,
        "prompt": prompt,
        "tools": tools,
    }

def route_by_type(state: Dict) -> str:
    """Route analysis based on query type."""
    query = state.get("input", "").lower()

    if any(word in query for word in ["trend", "over time", "growth"]):
        return "trend_analysis"
    elif any(word in query for word in ["compare", "difference", "versus"]):
        return "comparative_analysis"
    elif any(word in query for word in ["predict", "forecast", "future"]):
        return "predictive_analysis"
    else:
        return "general_analysis"

class BusinessAnalysisGraph:
    def __init__(self, llm=None):
        self._llm = llm
        self.graph = self._create_graph()

    @property
    def llm(self):
        if self._llm is None:
            key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
            self._llm = ChatGoogleGenerativeAI(
                model="gemini-3.5-flash-lite",
                temperature=0.2,
                google_api_key=key
            )
        return self._llm

    def _create_graph(self):
        """Create the analysis workflow graph with conditional routing."""
        workflow = StateGraph(dict)

        # Add nodes for different analysis types
        workflow.add_node("trend_analysis", self._trend_analysis)
        workflow.add_node("comparative_analysis", self._comparative_analysis)
        workflow.add_node("predictive_analysis", self._predictive_analysis)
        workflow.add_node("general_analysis", self._general_analysis)

        # Route dynamically from entry point
        workflow.set_conditional_entry_point(
            route_by_type,
            {
                "trend_analysis": "trend_analysis",
                "comparative_analysis": "comparative_analysis",
                "predictive_analysis": "predictive_analysis",
                "general_analysis": "general_analysis",
            }
        )

        # Add edges to END
        workflow.add_edge("trend_analysis", END)
        workflow.add_edge("comparative_analysis", END)
        workflow.add_edge("predictive_analysis", END)
        workflow.add_edge("general_analysis", END)

        return workflow.compile()

    async def _trend_analysis(self, state: Dict) -> Dict:
        """Perform trend analysis."""
        prompt = """Analyze trends in the following business data:

Data:
{data}

Focus on:
1. Time series patterns
2. Growth rates
3. Seasonal effects
4. Trend components
5. Notable changes

Question: {question}
"""
        formatted = prompt.format(data=state.get("data", ""), question=state.get("input", ""))
        response = await self.llm.ainvoke(formatted)
        response_text = response.content if hasattr(response, "content") else str(response)
        return {**state, "response": response_text, "analysis_type": "trend"}

    async def _comparative_analysis(self, state: Dict) -> Dict:
        """Perform comparative analysis."""
        prompt = """Compare the following aspects of the business data:

Data:
{data}

Focus on:
1. Key differences
2. Performance gaps
3. Relative strengths
4. Areas for improvement
5. Best practices

Question: {question}
"""
        formatted = prompt.format(data=state.get("data", ""), question=state.get("input", ""))
        response = await self.llm.ainvoke(formatted)
        response_text = response.content if hasattr(response, "content") else str(response)
        return {**state, "response": response_text, "analysis_type": "comparative"}

    async def _predictive_analysis(self, state: Dict) -> Dict:
        """Perform predictive analysis."""
        prompt = """Based on historical data, provide predictions and insights:

Data:
{data}

Consider:
1. Historical patterns
2. Growth trends
3. Market factors
4. Risk factors
5. Opportunities

Question: {question}
"""
        formatted = prompt.format(data=state.get("data", ""), question=state.get("input", ""))
        response = await self.llm.ainvoke(formatted)
        response_text = response.content if hasattr(response, "content") else str(response)
        return {**state, "response": response_text, "analysis_type": "predictive"}

    async def _general_analysis(self, state: Dict) -> Dict:
        """Perform general analysis."""
        prompt = """Analyze the following business data:

Data:
{data}

Provide:
1. Key insights
2. Important metrics
3. Notable patterns
4. Business implications
5. Recommendations

Question: {question}
"""
        formatted = prompt.format(data=state.get("data", ""), question=state.get("input", ""))
        response = await self.llm.ainvoke(formatted)
        response_text = response.content if hasattr(response, "content") else str(response)
        return {**state, "response": response_text, "analysis_type": "general"}

    async def analyze(self, data: Any, question: str) -> Dict:
        """Run analysis through the workflow graph."""
        initial_state = {
            "input": question,
            "data": data,
            "chat_history": []
        }

        result = await self.graph.ainvoke(initial_state)
        return {
            "response": result.get("response", ""),
            "analysis_type": result.get("analysis_type", "general"),
            "workflow_path": [result.get("analysis_type", "general")]
        }