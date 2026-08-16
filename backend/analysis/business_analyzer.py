from typing import Dict, List, Any
import pandas as pd
import numpy as np
from scipy import stats
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

class BusinessAnalyzer:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.df['Date'] = pd.to_datetime(self.df['Date'])
        self.insights = []

    def analyze_all(self) -> Dict[str, Any]:
        """Perform comprehensive business analysis."""
        return {
            "time_analysis": self.analyze_time_series(),
            "product_analysis": self.analyze_products(),
            "regional_analysis": self.analyze_regions(),
            "customer_segments": self.analyze_customer_segments(),
            "statistical_analysis": self.calculate_statistics(),
            "insights": self.insights
        }

    def analyze_time_series(self) -> Dict[str, Any]:
        """Analyze time-based patterns and trends."""
        daily_data = self.df.groupby('Date').agg({
            'Revenue': ['sum', 'mean', 'std'],
            'Units_Sold': ['sum', 'mean', 'std']
        }).reset_index()

        # Calculate moving averages
        daily_data['Revenue_MA7'] = daily_data[('Revenue', 'sum')].rolling(7).mean()
        daily_data['Revenue_MA30'] = daily_data[('Revenue', 'sum')].rolling(30).mean()

        # Calculate growth rates
        daily_data['Revenue_Growth'] = daily_data[('Revenue', 'sum')].pct_change()
        daily_data['Units_Growth'] = daily_data[('Units_Sold', 'sum')].pct_change()

        # Identify trends
        revenue_trend = np.polyfit(range(len(daily_data)), daily_data[('Revenue', 'sum')], 1)
        trend_direction = "upward" if revenue_trend[0] > 0 else "downward"

        self.insights.append(f"Revenue shows a {trend_direction} trend")

        return {
            "daily_metrics": daily_data.to_dict(),
            "trend": {
                "direction": trend_direction,
                "slope": float(revenue_trend[0])
            },
            "growth_rates": {
                "revenue_growth": daily_data['Revenue_Growth'].mean(),
                "units_growth": daily_data['Units_Growth'].mean()
            }
        }

    def analyze_products(self) -> Dict[str, Any]:
        """Analyze product performance and patterns."""
        product_metrics = self.df.groupby('Product').agg({
            'Revenue': ['sum', 'mean', 'count'],
            'Units_Sold': ['sum', 'mean']
        }).round(2)

        # Calculate market share
        total_revenue = self.df['Revenue'].sum()
        product_metrics['market_share'] = (
            product_metrics[('Revenue', 'sum')] / total_revenue * 100
        ).round(2)

        # Identify top and bottom performers
        top_products = product_metrics.nlargest(3, ('Revenue', 'sum'))
        bottom_products = product_metrics.nsmallest(3, ('Revenue', 'sum'))

        self.insights.append(
            f"Top performing product: {top_products.index[0]} "
            f"with {top_products.iloc[0][('Revenue', 'sum')]:,.2f} revenue"
        )

        return {
            "metrics": product_metrics.to_dict(),
            "top_performers": top_products.to_dict(),
            "bottom_performers": bottom_products.to_dict(),
            "market_share": product_metrics['market_share'].to_dict()
        }

    def analyze_regions(self) -> Dict[str, Any]:
        """Analyze regional performance and patterns."""
        regional_metrics = self.df.groupby('Region').agg({
            'Revenue': ['sum', 'mean', 'std'],
            'Units_Sold': ['sum', 'mean']
        }).round(2)

        # Calculate regional performance index
        regional_metrics['performance_index'] = (
            (regional_metrics[('Revenue', 'sum')] * 0.7) +
            (regional_metrics[('Units_Sold', 'sum')] * 0.3)
        )

        # Analyze regional product mix
        product_mix = self.df.pivot_table(
            values='Revenue',
            index='Region',
            columns='Category',
            aggfunc='sum'
        ).fillna(0)

        top_region = regional_metrics['performance_index'].idxmax()
        self.insights.append(
            f"Best performing region: {top_region} "
            f"with {regional_metrics.loc[top_region, ('Revenue', 'sum')]:,.2f} revenue"
        )

        return {
            "metrics": regional_metrics.to_dict(),
            "product_mix": product_mix.to_dict(),
            "performance_ranking": regional_metrics['performance_index'].sort_values(
                ascending=False
            ).to_dict()
        }

    def analyze_customer_segments(self) -> Dict[str, Any]:
        """Analyze customer segmentation patterns."""
        # Prepare features for clustering
        features = self.df.groupby('Product').agg({
            'Revenue': 'mean',
            'Units_Sold': 'mean'
        }).reset_index()

        # Scale features
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(
            features[['Revenue', 'Units_Sold']]
        )

        # Perform clustering
        kmeans = KMeans(n_clusters=3, random_state=42)
        features['Segment'] = kmeans.fit_predict(scaled_features)

        # Analyze segments
        segment_profiles = features.groupby('Segment').agg({
            'Revenue': ['mean', 'min', 'max'],
            'Units_Sold': ['mean', 'min', 'max']
        }).round(2)

        self.insights.append(
            f"Identified {len(segment_profiles)} distinct customer segments"
        )

        return {
            "segments": features.to_dict(),
            "segment_profiles": segment_profiles.to_dict(),
            "cluster_centers": {
                f"Cluster_{i}": center.tolist()
                for i, center in enumerate(kmeans.cluster_centers_)
            }
        }

    def calculate_statistics(self) -> Dict[str, Any]:
        """Calculate detailed statistical measures."""
        stats_dict = {}

        for metric in ['Revenue', 'Units_Sold']:
            stats_dict[metric] = {
                "mean": float(self.df[metric].mean()),
                "median": float(self.df[metric].median()),
                "std": float(self.df[metric].std()),
                "skew": float(stats.skew(self.df[metric])),
                "kurtosis": float(stats.kurtosis(self.df[metric])),
                "q1": float(self.df[metric].quantile(0.25)),
                "q3": float(self.df[metric].quantile(0.75)),
                "iqr": float(
                    self.df[metric].quantile(0.75) -
                    self.df[metric].quantile(0.25)
                )
            }

            # Add correlation analysis
            correlations = self.df[[metric, 'Units_Sold']].corr()[metric]
            stats_dict[f"{metric}_correlations"] = correlations.to_dict()

        return stats_dict

    def get_insights(self) -> List[str]:
        """Get accumulated insights."""
        return self.insights