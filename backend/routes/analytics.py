from fastapi import APIRouter, Query
import duckdb
import pandas as pd
import os

router = APIRouter()

SYSTEM_PROMPT = """Given a table 'sales_data' with columns:
- Date (date)
- Product (text)
- Region (text)
- Sales (numeric)
- Customer_Age (numeric)
- Customer_Gender (text)
- Customer_Satisfaction (numeric 1-5)

Convert the following question into a SQL query.
Question: {question}

Return only the SQL query without any explanation."""

def natural_to_sql(question: str) -> str:
    """Convert natural language question to SQL query."""
    try:
        question_lower = question.lower()

        # Time-based queries
        if any(word in question_lower for word in ['trend', 'time', 'over time']):
            return """
            SELECT Date, SUM(Sales) as total_sales
            FROM sales_data
            GROUP BY Date
            ORDER BY Date
            """

        # Product-based queries
        elif any(word in question_lower for word in ['product', 'item']):
            return """
            SELECT Product,
                   SUM(Sales) as total_sales,
                   AVG(Customer_Satisfaction) as avg_satisfaction
            FROM sales_data
            GROUP BY Product
            """

        # Customer satisfaction queries
        elif 'satisfaction' in question_lower:
            return """
            SELECT Product,
                   AVG(Customer_Satisfaction) as avg_satisfaction
            FROM sales_data
            GROUP BY Product
            """

        # Default to daily sales
        return """
        SELECT Date, SUM(Sales) as total_sales
        FROM sales_data
        GROUP BY Date
        ORDER BY Date
        """

    except Exception as e:
        raise Exception(f"Failed to convert to SQL: {str(e)}")

@router.get("/api/analytics")
def run_analytics(query: str = Query(...)):
    # Read the sample data
    df = pd.read_csv("sample_sales_data.csv")
    con = duckdb.connect()
    con.register("sales_data", df)

    try:
        # Convert natural language to SQL
        sql_query = natural_to_sql(query)
        print(f"Generated SQL: {sql_query}")  # For debugging

        # Execute the SQL
        df = con.execute(sql_query).df()

        # Format the response in a conversational way
        # Detect whichever satisfaction column the SQL produced
        sat_col = next(
            (c for c in df.columns if 'satisfaction' in c.lower()),
            None
        )
        prod_col = next(
            (c for c in df.columns if 'product' in c.lower()),
            None
        )
        sales_col = next(
            (c for c in df.columns if c.lower() in ('sales', 'total_sales', 'sum_sales', 'revenue')),
            None
        )

        # Build a narrative appropriate to the columns actually returned
        if sat_col and prod_col:
            # Satisfaction breakdown by product
            df = df.sort_values(sat_col, ascending=False)
            chat_response = "Here's what I found about customer satisfaction:\n\n"
            for _, row in df.iterrows():
                score = round(float(row[sat_col]), 2)
                chat_response += f"• {row[prod_col]}: {score} out of 5\n"
            best_product  = df.iloc[0][prod_col]
            worst_product = df.iloc[-1][prod_col]
            avg_diff = round(float(df[sat_col].max() - df[sat_col].min()), 2)
            chat_response += f"\nKey insights:\n"
            chat_response += f"• {best_product} has the highest satisfaction rating\n"
            chat_response += f"• {worst_product} has the lowest satisfaction rating\n"
            chat_response += f"• The difference between highest and lowest is {avg_diff} points"

        elif sales_col and prod_col:
            # Sales breakdown by product
            df = df.sort_values(sales_col, ascending=False)
            chat_response = "Here's the sales breakdown by product:\n\n"
            for _, row in df.iterrows():
                chat_response += f"• {row[prod_col]}: {int(row[sales_col])} sales\n"
            chat_response += f"\nKey insights:\n"
            chat_response += f"• {df.iloc[0][prod_col]} is the top-selling product\n"
            chat_response += f"• {df.iloc[-1][prod_col]} has the lowest sales"

        elif 'date' in [c.lower() for c in df.columns] and sales_col:
            # Time-series result
            chat_response = f"Here's the sales trend over time ({len(df)} data points):\n\n"
            chat_response += f"• Total transactions: {int(df[sales_col].sum())}\n"
            chat_response += f"• Average per period: {round(float(df[sales_col].mean()), 1)}\n"
            chat_response += f"• Peak: {int(df[sales_col].max())} on {df.loc[df[sales_col].idxmax(), 'Date']}"

        else:
            # Generic fallback — summarise whatever columns came back
            chat_response = f"Here are the results ({len(df)} rows):\n\n"
            for _, row in df.head(10).iterrows():
                chat_response += "• " + ", ".join(f"{k}: {v}" for k, v in row.items()) + "\n"

        return {
            "result": df.to_dict(orient="records"),
            "chat_response": chat_response
        }
    except Exception as e:
        return {"error": str(e), "query": query}
    finally:
        con.close()

