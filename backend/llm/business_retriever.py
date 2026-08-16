import pandas as pd
import os
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from typing import List, Dict, Any
import numpy as np
from datetime import datetime

class BusinessMetricsRetriever(BaseRetriever):
    """Custom retriever for business metrics and statistical analysis."""

    def __init__(self, df: pd.DataFrame):
        super().__init__()
        self.df = df
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        self.cached_metrics = {}

    def _get_time_based_metrics(self) -> Dict[str, Any]:
        """Calculate comprehensive time-based metrics."""
        if 'Date' in self.df.columns:
            self.df['Date'] = pd.to_datetime(self.df['Date'])
            self.df['Month'] = self.df['Date'].dt.to_period('M')
            self.df['DayOfWeek'] = self.df['Date'].dt.day_name()

            daily_sales = self.df.groupby('Date')['Sales'].sum()
            monthly_sales = self.df.groupby('Month')['Sales'].sum()

            # Moving averages and trends
            moving_avg_7 = daily_sales.rolling(window=7).mean()
            moving_avg_30 = daily_sales.rolling(window=30).mean()

            # Seasonality and patterns
            day_of_week_pattern = self.df.groupby('DayOfWeek')['Sales'].agg(['mean', 'std']).to_dict()

            # Growth and change metrics
            month_over_month = monthly_sales.pct_change().round(3)

            return {
                'daily_metrics': {
                    'sales': daily_sales.to_dict(),
                    'moving_avg_7d': moving_avg_7.to_dict(),
                    'moving_avg_30d': moving_avg_30.to_dict(),
                    'peak_day': daily_sales.idxmax().strftime('%Y-%m-%d'),
                    'peak_value': float(daily_sales.max())
                },
                'monthly_metrics': {
                    'sales': monthly_sales.to_dict(),
                    'growth_rates': month_over_month.dropna().to_dict(),
                    'strongest_month': str(monthly_sales.idxmax()),
                    'weakest_month': str(monthly_sales.idxmin())
                },
                'patterns': {
                    'day_of_week': day_of_week_pattern,
                    'weekend_vs_weekday': {
                        'weekend_avg': self.df[self.df['DayOfWeek'].isin(['Saturday', 'Sunday'])]['Sales'].mean(),
                        'weekday_avg': self.df[~self.df['DayOfWeek'].isin(['Saturday', 'Sunday'])]['Sales'].mean()
                    }
                }
            }
        return {}

    def _get_product_metrics(self) -> Dict[str, Any]:
        """Calculate comprehensive product-related metrics."""
        if 'Product' in self.df.columns:
            # Basic product performance
            product_sales = self.df.groupby('Product')['Sales'].agg(['sum', 'mean', 'std']).round(2)
            product_satisfaction = self.df.groupby('Product')['Customer_Satisfaction'].agg(['mean', 'std', 'count']).round(2)

            # Product performance by region
            regional_performance = self.df.pivot_table(
                index='Product',
                columns='Region',
                values=['Sales', 'Customer_Satisfaction'],
                aggfunc={'Sales': 'sum', 'Customer_Satisfaction': 'mean'}
            ).round(2)

            # Customer age segments by product
            age_segments = {
                'young': self.df['Customer_Age'] < 30,
                'middle': (self.df['Customer_Age'] >= 30) & (self.df['Customer_Age'] < 50),
                'senior': self.df['Customer_Age'] >= 50
            }
            product_age_distribution = {
                segment: self.df[mask].groupby('Product')['Sales'].sum()
                for segment, mask in age_segments.items()
            }

            return {
                'performance': {
                    'sales': product_sales.to_dict(),
                    'satisfaction': product_satisfaction.to_dict(),
                    'top_products': {
                        'by_sales': product_sales['sum'].nlargest(3).index.tolist(),
                        'by_satisfaction': product_satisfaction['mean'].nlargest(3).index.tolist()
                    }
                },
                'regional_analysis': regional_performance.to_dict(),
                'customer_segments': {
                    segment: data.to_dict()
                    for segment, data in product_age_distribution.items()
                },
                'correlations': {
                    'sales_satisfaction': self.df.groupby('Product').apply(
                        lambda x: x['Sales'].corr(x['Customer_Satisfaction'])
                    ).round(3).to_dict()
                }
            }
        return {}

    def _get_customer_metrics(self) -> Dict[str, Any]:
        """Calculate comprehensive customer-related metrics."""
        metrics = {}

        # Age-based analysis
        if 'Customer_Age' in self.df.columns:
            age_stats = self.df['Customer_Age'].agg(['mean', 'median', 'std', 'min', 'max']).round(2)
            age_segments = {
                'young': self.df[self.df['Customer_Age'] < 30],
                'middle': self.df[(self.df['Customer_Age'] >= 30) & (self.df['Customer_Age'] < 50)],
                'senior': self.df[self.df['Customer_Age'] >= 50]
            }

            metrics['age_analysis'] = {
                'statistics': age_stats.to_dict(),
                'segments': {
                    name: {
                        'count': len(segment),
                        'avg_satisfaction': segment['Customer_Satisfaction'].mean().round(2),
                        'total_sales': segment['Sales'].sum().round(2),
                        'preferred_products': segment.groupby('Product')['Sales'].sum().nlargest(2).index.tolist()
                    }
                    for name, segment in age_segments.items()
                },
                'distribution': self.df['Customer_Age'].value_counts().sort_index().to_dict()
            }

        # Satisfaction analysis
        if 'Customer_Satisfaction' in self.df.columns:
            satisfaction_stats = self.df['Customer_Satisfaction'].agg(['mean', 'median', 'std', 'min', 'max']).round(2)
            satisfaction_segments = {
                'low': self.df[self.df['Customer_Satisfaction'] <= 2],
                'medium': self.df[(self.df['Customer_Satisfaction'] > 2) & (self.df['Customer_Satisfaction'] <= 4)],
                'high': self.df[self.df['Customer_Satisfaction'] > 4]
            }

            metrics['satisfaction_analysis'] = {
                'statistics': satisfaction_stats.to_dict(),
                'segments': {
                    name: {
                        'count': len(segment),
                        'avg_age': segment['Customer_Age'].mean().round(2),
                        'total_sales': segment['Sales'].sum().round(2),
                        'common_products': segment.groupby('Product')['Sales'].sum().nlargest(2).index.tolist()
                    }
                    for name, segment in satisfaction_segments.items()
                }
            }

        # Regional patterns
        if 'Region' in self.df.columns:
            metrics['regional_patterns'] = {
                'customer_distribution': self.df.groupby('Region').size().to_dict(),
                'satisfaction_by_region': self.df.groupby('Region')['Customer_Satisfaction'].agg(['mean', 'std']).round(2).to_dict(),
                'age_by_region': self.df.groupby('Region')['Customer_Age'].agg(['mean', 'std']).round(2).to_dict()
            }

        # Purchase behavior
        metrics['purchase_patterns'] = {
            'sales_by_satisfaction': self.df.groupby(pd.qcut(self.df['Customer_Satisfaction'], q=4))['Sales'].mean().round(2).to_dict(),
            'sales_by_age': self.df.groupby(pd.qcut(self.df['Customer_Age'], q=4))['Sales'].mean().round(2).to_dict()
        }

        return metrics

    def _calculate_growth_rate(self) -> Dict[str, float]:
        """Calculate month-over-month growth rates."""
        monthly_sales = self.df.groupby(self.df['Date'].dt.to_period('M'))['Sales'].sum()
        growth_rates = monthly_sales.pct_change().round(3)
        return growth_rates.dropna().to_dict()

    def _create_metric_document(self, metrics: Dict[str, Any], metric_type: str) -> Document:
        """Convert metrics into a document with metadata."""
        content = f"{metric_type} Metrics:\n"
        for key, value in metrics.items():
            content += f"{key}: {value}\n"
        return Document(
            page_content=content,
            metadata={"type": metric_type, "timestamp": datetime.now().isoformat()}
        )

    def get_relevant_documents(self, query: str) -> List[Document]:
        """Get relevant metric documents based on the query."""
        # Calculate metrics if not cached
        if not self.cached_metrics:
            self.cached_metrics = {
                "time": self._get_time_based_metrics(),
                "product": self._get_product_metrics(),
                "customer": self._get_customer_metrics()
            }

        documents = []
        for metric_type, metrics in self.cached_metrics.items():
            if metrics:  # Only include non-empty metrics
                documents.append(self._create_metric_document(metrics, metric_type))

        # Get embeddings for query and documents
        query_embedding = self.embeddings.embed_query(query)
        doc_embeddings = [self.embeddings.embed_query(doc.page_content) for doc in documents]

        # Calculate similarities
        similarities = [np.dot(query_embedding, doc_emb) for doc_emb in doc_embeddings]
        sorted_docs = [doc for _, doc in sorted(zip(similarities, documents), reverse=True)]

        return sorted_docs[:2]  # Return top 2 most relevant metric documents

    async def aget_relevant_documents(self, query: str) -> List[Document]:
        """Async version of get_relevant_documents."""
        return self.get_relevant_documents(query)