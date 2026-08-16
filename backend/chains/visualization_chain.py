from langchain_core.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_core.output_parsers import BaseOutputParser
import json

CHART_SELECTION_PROMPT = """Based on the data and visualization request, recommend the most appropriate chart type and configuration.

Data Summary:
{data_summary}

Visualization Request: {request}

Previous Context:
{context}

Consider:
1. The type of data being shown
2. The relationships to highlight
3. The key message to convey
4. The most effective visual representation

Recommend a chart configuration that best communicates the insights."""

class ChartConfigParser(BaseOutputParser):
    def parse(self, text):
        """Parse LLM output into chart configuration."""
        # Implementation would parse the text into a structured chart config
        try:
            # Extract chart type and configuration
            return {
                "type": "determine from text",
                "config": "extract from text",
                "data_requirements": "extract from text"
            }
        except Exception as e:
            return {
                "type": "fallback",
                "config": "basic",
                "error": str(e)
            }

class ChartGenerator:
    def __init__(self, llm):
        self.llm = llm

        # Initialize chart selection chain
        self.selection_chain = LLMChain(
            llm=llm,
            prompt=PromptTemplate(
                input_variables=["data_summary", "request", "context"],
                template=CHART_SELECTION_PROMPT
            ),
            output_parser=ChartConfigParser(),
            verbose=True
        )

    async def generate_chart(self, data, request, context=None):
        """Generate appropriate chart based on data and request."""
        # Get chart configuration
        chart_config = await self.selection_chain.arun(
            data_summary=self._summarize_data(data),
            request=request,
            context=context or ""
        )

        # Generate chart specification
        if chart_config["type"] == "line":
            spec = self._generate_line_chart(data, chart_config["config"])
        elif chart_config["type"] == "bar":
            spec = self._generate_bar_chart(data, chart_config["config"])
        elif chart_config["type"] == "pie":
            spec = self._generate_pie_chart(data, chart_config["config"])
        elif chart_config["type"] == "scatter":
            spec = self._generate_scatter_plot(data, chart_config["config"])
        else:
            spec = self._generate_fallback_chart(data)

        return {
            "chart_spec": spec,
            "config": chart_config,
            "insights": self._extract_visual_insights(data, spec)
        }

    def _summarize_data(self, data):
        """Create a summary of the data for visualization purposes."""
        # Implementation would summarize key data characteristics
        return str(data)

    def _generate_line_chart(self, data, config):
        """Generate a line chart specification."""
        return {
            "type": "line",
            "data": data,
            "options": {
                "xAxis": config.get("x_axis"),
                "yAxis": config.get("y_axis"),
                "title": config.get("title")
            }
        }

    def _generate_bar_chart(self, data, config):
        """Generate a bar chart specification."""
        return {
            "type": "bar",
            "data": data,
            "options": {
                "xAxis": config.get("x_axis"),
                "yAxis": config.get("y_axis"),
                "title": config.get("title")
            }
        }

    def _generate_pie_chart(self, data, config):
        """Generate a pie chart specification."""
        return {
            "type": "pie",
            "data": data,
            "options": {
                "title": config.get("title")
            }
        }

    def _generate_scatter_plot(self, data, config):
        """Generate a scatter plot specification."""
        return {
            "type": "scatter",
            "data": data,
            "options": {
                "xAxis": config.get("x_axis"),
                "yAxis": config.get("y_axis"),
                "title": config.get("title")
            }
        }

    def _generate_fallback_chart(self, data):
        """Generate a simple fallback chart when type cannot be determined."""
        return {
            "type": "bar",
            "data": data,
            "options": {
                "title": "Data Overview"
            }
        }

    def _extract_visual_insights(self, data, spec):
        """Extract insights from the visualization."""
        # Implementation would analyze the visualization for insights
        return []