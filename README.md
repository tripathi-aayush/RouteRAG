# RouteRAG: AI-Powered Business Intelligence Assistant
## Comprehensive Technical Document & Blog Post

---

## Table of Contents

### Part 1 — Technical Document

1. [Problem Statement](#1-problem-statement)
2. [Project Overview & Objectives](#2-project-overview--objectives)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Data Architecture & Schema](#5-data-architecture--schema)
6. [Core Components](#6-core-components)
7. [RAG System Design](#7-rag-system-design)
8. [Memory Integration](#8-memory-integration)
9. [LLM Orchestration & Prompt Engineering](#9-llm-orchestration--prompt-engineering)
10. [Analytics Engine](#10-analytics-engine)
11. [Visualization System](#11-visualization-system)
12. [Model Evaluation & LLMOps](#12-model-evaluation--llmops)
13. [API Reference](#13-api-reference)
14. [Frontend Architecture](#14-frontend-architecture)
15. [Configuration & Deployment](#15-configuration--deployment)
16. [Performance Characteristics](#16-performance-characteristics)
- [Appendix A: Supported Analysis Types](#appendix-a-supported-analysis-types)
- [Appendix B: Evaluation Preset Questions](#appendix-b-evaluation-preset-questions)

### Part 2 — Blog Post

- [The Problem: Data Rich, Insight Poor](#the-problem-data-rich-insight-poor)
- [What Is RouteRAG?](#what-is-routerag)
- [How It Works: The Architecture](#how-it-works-the-architecture)
- [Building the Knowledge Base](#building-the-knowledge-base)
- [The Smart Query Router](#the-smart-query-router)
- [Memory: Making Conversations Coherent](#memory-making-conversations-coherent)
- [Prompt Engineering That Works](#prompt-engineering-that-works)
- [Measuring Quality with QAEvalChain](#measuring-quality-with-qaeval-chain)
- [Key Lessons Learned](#key-lessons-learned)
- [What's Next](#whats-next-for-routerag)
- [Conclusion](#conclusion)

---

# Part 1 — Technical Document

---

## 1. Problem Statement

### 1.1 The Business Intelligence Gap

In today's data-centric business environment, organizations across industries accumulate vast amounts of operational and transactional data. However, the ability to transform this raw data into actionable insights remains a significant challenge — particularly for small to medium-sized enterprises (SMEs) that lack the budget, personnel, and infrastructure for advanced business intelligence (BI) tools.

Traditional BI solutions require:
- Dedicated data analysts with specialized skill sets
- Complex BI platforms (Tableau, Power BI) with steep learning curves
- Significant upfront investment in licensing and infrastructure
- Time-intensive report generation cycles

This creates a **compounding knowledge gap**: the organizations that need data-driven decisions most urgently are precisely those least equipped to generate them.

### 1.2 Opportunity in AI Advancement

Recent breakthroughs in artificial intelligence — specifically in **Large Language Models (LLMs)** and **Retrieval-Augmented Generation (RAG)** systems — offer an unprecedented opportunity to democratize business intelligence. These technologies enable:

- **Conversational data exploration** — query data in plain English without SQL knowledge
- **Contextual insight generation** — synthesize patterns across multiple data dimensions simultaneously
- **Grounded responses** — RAG ensures answers are tied to actual business data, not hallucinated
- **Automated visualization** — auto-select and render appropriate charts for each query

### 1.3 The RouteRAG Solution

RouteRAG addresses these challenges by delivering an **automated, conversational AI Business Intelligence Assistant** that enables any business user — regardless of technical background — to extract meaningful insights from their data through natural language interaction.

---

## 2. Project Overview & Objectives

### 2.1 Project Summary

| Attribute | Detail |
|-----------|--------|
| **Project Name** | RouteRAG |
| **Type** | AI-Powered Business Intelligence Assistant |
| **Primary Technologies** | LangChain, RAG, LLMs (OpenAI GPT-4), FastAPI, Next.js |
| **Target Users** | Business analysts, SME owners, operations teams |
| **Data Domain** | Sales, product, regional, and customer analytics |

### 2.2 Core Objectives

| Objective | Description |
|-----------|-------------|
| **Analyze Business Data** | Identify key trends and patterns across time, products, regions, and customer demographics |
| **Generate Insights & Recommendations** | Use NLP to produce actionable business insights with structured recommendations |
| **Visualize Data Insights** | Present findings through interactive charts and dashboards for intuitive interpretation |

### 2.3 Project Phases

**Part 1: AI-Powered Business Intelligence Assistant**
Steps 1–6: Data preparation → Knowledge base → LLM development → Chain prompts → RAG setup → Memory integration

**Part 2: LLMOps & User Interface**
Steps 7+: Model evaluation (QAEvalChain) → Data visualization → Next.js UI creation

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                               │
│              Next.js Frontend (Port 3000)                       │
│   ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐  │
│   │  Chat UI  │  │ Analytics │  │ History  │  │ Evaluation  │  │
│   └──────────┘  └───────────┘  └──────────┘  └─────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────▼────────────────────────────────────┐
│                     API GATEWAY LAYER                           │
│              FastAPI Backend (Port 9100)                        │
│  /query  /upload  /session  /chart  /evaluate                   │
│  /analytics  /dashboard  /feedback  /history                    │
└──────────────┬──────────────────┬───────────────────┬───────────┘
               │                  │                   │
    ┌──────────▼──────┐  ┌────────▼────────┐  ┌──────▼──────────┐
    │   LLM LAYER     │  │ ANALYTICS LAYER │  │  STORAGE LAYER  │
    │                 │  │                 │  │                 │
    │ LangChain       │  │ DuckDB (SQL)    │  │ PostgreSQL      │
    │ LangGraph       │  │ Pandas          │  │ + pgvector      │
    │ OpenAI GPT-4    │  │ scikit-learn    │  │                 │
    │ GPT-3.5-turbo   │  │ SciPy           │  │ Sessions,Chunks │
    │ text-ada-002    │  │ BusinessAnalyzer│  │ Metrics, Sales  │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 3.2 Component Architecture

```
BusinessAnalytics/
├── backend/
│   ├── main.py                    ← App entry point + router registration
│   ├── models.py                  ← SQLAlchemy ORM (10 tables)
│   ├── db.py                      ← Database session management
│   ├── llm/
│   │   ├── analysis_graph.py      ← LangGraph 4-node analysis workflow
│   │   ├── business_retriever.py  ← Custom RAG retriever (cosine similarity)
│   │   ├── rag_manager.py         ← RAG pipeline: embed → retrieve → generate
│   │   └── business_prompts.py    ← Prompt templates & manager
│   ├── analysis/
│   │   └── business_analyzer.py   ← Time-series, products, regions, K-means
│   ├── visualization/
│   │   └── chart_engine.py        ← 6 chart types
│   ├── chains/
│   │   ├── analysis_chain.py
│   │   ├── business_analysis_chain.py  ← Memory-integrated chain
│   │   └── visualization_chain.py
│   ├── evaluation/
│   │   ├── qa_eval.py             ← QAEvalChain (4-dimension scoring)
│   │   └── model_monitor.py       ← Feedback collection & monitoring
│   ├── utils/
│   │   ├── embeddings.py          ← OpenAI embedding helpers
│   │   ├── data_processor.py      ← CSV processing & normalization
│   │   └── rag_prompts.py         ← RAG prompt utilities
│   └── routes/
│       ├── rag.py, analytics.py, session.py, feedback.py
│       └── chart.py, upload.py, dashboard.py, evaluate.py
├── frontend/
│   ├── pages/                     ← 6 application pages
│   ├── components/                ← Reusable React components
│   └── styles/globals.css
├── sample_sales_data.csv          ← 2,501-record sample dataset
├── requirements.txt
└── run_all.sh                     ← Startup orchestration script
```

### 3.3 Request Routing Flow

Every incoming query is classified before any LLM call is made, routing it to the cheapest appropriate handler:

```
POST /api/query
    │
    ├─→ classify_query()
    │        │
    │        ├── chart keywords?      → ChartEngine.create_visualization()
    │        ├── analytics keywords?  → natural_to_sql() → DuckDB execute
    │        └── default              → RAG Pipeline
    │                                        │
    │                                   get_embedding() [OpenAI]
    │                                        │
    │                                   pgvector similarity search
    │                                        │
    │                                   cosine_similarity re-ranking
    │                                        │
    │                                   Top-3 chunks → LLM (GPT-3.5)
    │                                        │
    │                                   Session memory update
    ▼
Structured JSON Response → Frontend
```

---

## 4. Technology Stack

### 4.1 Backend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Web Framework | FastAPI | Latest | Async REST API with Pydantic validation |
| LLM Orchestration | LangChain | Latest | Chains, retrievers, prompt templates |
| LLM Workflow | LangGraph | Latest | 4-node stateful analysis graph |
| LLM — Deep Analysis | OpenAI GPT-4 | Latest | Complex analysis (temperature=0.2) |
| LLM — Fast Responses | OpenAI GPT-3.5-turbo | Latest | RAG synthesis + evaluation |
| Embeddings | text-embedding-ada-002 | Latest | Query & document vectorization (1536-dim) |
| Vector Search | pgvector (PostgreSQL ext.) | Latest | Semantic similarity search |
| Analytics DB | DuckDB | Latest | In-memory OLAP SQL queries |
| Data Processing | Pandas | Latest | DataFrame operations & aggregations |
| Machine Learning | scikit-learn | Latest | K-means clustering, StandardScaler |
| Statistics | SciPy | Latest | Skew, kurtosis, statistical moments |
| ORM | SQLAlchemy | Latest | Database session management |
| Migrations | Alembic | Latest | Schema version control |
| Server | Uvicorn | Latest | ASGI server for FastAPI |

### 4.2 Frontend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | 13.4.7 | SSR/SSG React framework |
| UI Library | React | 18.2.0 | Component-based UI |
| Styling | Tailwind CSS | 3.3.2 | Utility-first CSS framework |
| Charts | Nivo | 0.99.0 | D3-based data visualization |
| Icons | lucide-react | 0.244.0 | SVG icon system |
| Animations | framer-motion | 10.12.16 | Smooth transitions |

### 4.3 Storage & Infrastructure

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| Primary Database | PostgreSQL + pgvector | 5432 | Sessions, messages, embeddings, metrics |
| Analytics Engine | DuckDB | — | In-memory OLAP over uploaded CSVs |
| Backend API | Uvicorn (FastAPI) | 9100 | REST API + Swagger UI at `/docs` |
| Frontend | Next.js Dev Server | 3000 | React application |

---

## 5. Data Architecture & Schema

### 5.1 Database Schema (PostgreSQL — 10 Tables)

```
┌──────────────────┐     ┌─────────────────────┐
│      users       │     │    chat_sessions     │
├──────────────────┤     ├─────────────────────┤
│ id (PK)          │◄────│ user_id (FK)         │
│ email            │     │ id (PK)             │
│ created_at       │     │ title               │
└──────────────────┘     │ created_at          │
                         │ updated_at          │
                         └──────────┬──────────┘
                                    │
            ┌───────────────────────┼──────────────────────┐
            ▼                       ▼                      ▼
┌───────────────────┐  ┌──────────────────────┐  ┌─────────────────┐
│     messages      │  │  session_summaries   │  │    feedback     │
├───────────────────┤  ├──────────────────────┤  ├─────────────────┤
│ id (PK)           │  │ session_id (FK, PK)  │  │ id (PK)         │
│ session_id (FK)   │  │ summary (TEXT)       │  │ session_id (FK) │
│ role              │  │ updated_at           │  │ message_id (FK) │
│ content (TEXT)    │  └──────────────────────┘  │ rating (1–5)    │
│ created_at        │                            │ feedback_text   │
└───────────────────┘                            └─────────────────┘

┌──────────────────────┐    ┌─────────────────────┐
│  business_documents  │    │   document_chunks   │
├──────────────────────┤    ├─────────────────────┤
│ id (PK)              │◄───│ document_id (FK)    │
│ source_type          │    │ id (PK)             │
│ title                │    │ chunk_text (TEXT)   │
│ raw_content          │    │ chunk_index         │
│ metadata_json        │    │ embedding (vector)  │
└──────────────────────┘    │ metadata_json       │
                            └─────────────────────┘

┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ business_metrics │   │  sales_records   │   │    products      │
├──────────────────┤   ├──────────────────┤   ├──────────────────┤
│ id (PK)          │   │ id (PK)          │   │ product_id (PK)  │
│ metric_name      │   │ order_date       │   │ product_name     │
│ definition       │   │ region           │   │ category         │
│ formula          │   │ product_id (FK)  │   │ price_band       │
│ owner            │   │ customer_id (FK) │   └──────────────────┘
│ refresh_freq     │   │ revenue, qty     │
└──────────────────┘   └──────────────────┘   ┌──────────────────┐
                                               │   customers      │
                                               ├──────────────────┤
                                               │ customer_id (PK) │
                                               │ segment          │
                                               │ geography        │
                                               │ demographic_group│
                                               └──────────────────┘
```

### 5.2 Sample Dataset

| Attribute | Value |
|-----------|-------|
| **File** | `sample_sales_data.csv` |
| **Records** | 2,501 rows |
| **Date Range** | 2022-01-01 onward |

| Column | Type | Values / Range |
|--------|------|----------------|
| `Date` | DATE | YYYY-MM-DD |
| `Product` | STRING | Widget A, B, C, D |
| `Region` | STRING | North, South, East, West |
| `Sales` | FLOAT | Transaction amount |
| `Customer_Age` | INT | 18–80 |
| `Customer_Gender` | STRING | Male, Female |
| `Customer_Satisfaction` | FLOAT | 1.0–5.0 |

4 products × 4 regions × 3 demographic groups × time series = dozens of analytical dimensions from a simple 7-column file.

### 5.3 Column Alias Normalization

The system auto-normalizes uploaded CSV column names so varied naming conventions all map to the expected schema:

```python
_COLUMN_ALIASES = {
    "date": "Date",  "product": "Product",  "region": "Region",
    "sales": "Sales",  "revenue": "Sales",  "units": "Sales",
    "customer_age": "Customer_Age",  "age": "Customer_Age",
    "customer_gender": "Customer_Gender",  "gender": "Customer_Gender",
    "customer_satisfaction": "Customer_Satisfaction",  "satisfaction": "Customer_Satisfaction"
}
```

---

## 6. Core Components

### 6.1 RAG Manager (`backend/llm/rag_manager.py`)

The central pipeline controller — transforms raw CSV data into searchable knowledge and generates LLM-grounded responses.

| Method | Description |
|--------|-------------|
| `process_business_data()` | Splits data into 4 semantic chunk types (category, regional, time-based, product) and stores embeddings in pgvector |
| `get_relevant_context()` | Cosine similarity search against stored embeddings; returns top-k chunks |
| `generate_response()` | Assembles context + session history into an LLM prompt and returns the answer |
| `extract_insights()` | Parses structured insight fields from the raw LLM response text |

**Embedding model:** `text-embedding-ada-002` (1,536-dim vectors)
**Token tracking:** `get_openai_callback()` context manager logs usage per call.

### 6.2 Custom Business Retriever (`backend/llm/business_retriever.py`)

Extends LangChain's `BaseRetriever` with three domain-specific metric extractors:

```python
class BusinessRetriever(BaseRetriever):

    def _get_time_based_metrics(self, df) -> dict:
        # 7-day / 30-day moving averages
        # Day-of-week seasonality patterns
        # Month-over-month growth rates
        # Peak day identification

    def _get_product_metrics(self, df) -> dict:
        # Product × Region cross-tabulation
        # Age-based segmentation analysis
        # Satisfaction–sales correlation

    def _get_customer_metrics(self, df) -> dict:
        # Age segment profiling (young/middle/senior)
        # Satisfaction tiers (low/medium/high)
        # Purchase behavior patterns

    def get_relevant_documents(self, query: str) -> List[Document]:
        # 1. Embed query with OpenAI
        # 2. Cosine similarity vs. all stored chunk embeddings
        # 3. Return top-2 most relevant metric documents
```

### 6.3 LangGraph Analysis Workflow (`backend/llm/analysis_graph.py`)

A stateful 4-node directed graph that routes each query to a specialized analysis handler before passing to GPT-4 for synthesis:

```
              ┌──────────────────┐
              │  route_by_type() │  ← Classifies query by keywords
              └────────┬─────────┘
       ┌───────────────┼───────────────┐──────────────┐
       ▼               ▼               ▼              ▼
  ┌─────────┐   ┌───────────┐   ┌──────────┐  ┌──────────┐
  │  Trend  │   │Comparative│   │Predictive│  │ General  │
  │Analysis │   │ Analysis  │   │ Analysis │  │ Analysis │
  └────┬────┘   └─────┬─────┘   └────┬─────┘  └────┬─────┘
       └───────────────┴──────────────┴──────────────┘
                              │
                     ┌────────▼────────┐
                     │  GPT-4 Synthesis │
                     │  (temp = 0.2)   │
                     └─────────────────┘
```

| Analysis Type | Routing Keywords |
|--------------|-----------------|
| Trend | "trend", "over time", "growth", "decline" |
| Comparative | "compare", "vs", "difference", "better", "worse" |
| Predictive | "predict", "forecast", "future", "expect" |
| General | *(default fallback)* |

### 6.4 Business Analyzer (`backend/analysis/business_analyzer.py`)

The core pandas-powered analytics engine. `analyze_all()` orchestrates five sub-analyses and returns a unified insight dictionary:

| Method | What It Computes |
|--------|-----------------|
| `analyze_time_series()` | Daily aggregations, 7-day rolling avg, MoM growth, trend direction via `np.polyfit` |
| `analyze_products()` | Revenue per product, market share (%), top/bottom performers, satisfaction scores |
| `analyze_regions()` | Revenue by region, satisfaction per region, product mix, performance index |
| `analyze_customer_segments()` | K-means (n=3) on age + revenue after StandardScaler normalization |
| `calculate_statistics()` | Mean, median, std, skewness, kurtosis, Q1, Q3, IQR for each numeric column |

---

## 7. RAG System Design

### 7.1 End-to-End RAG Pipeline

```
━━━━ PHASE 1: INDEXING (at upload time) ━━━━━━━━━━━━━━━━━━━━━━━━━

CSV Upload → POST /api/upload
    │
    ▼
RAGManager.process_business_data()
    ├── Category Summary    (Product × Region cross-tabs)
    ├── Regional Summary    (revenue + satisfaction per region)
    ├── Time-based Summary  (monthly/weekly aggregates)
    └── Product Summary     (per-product performance metrics)
    │
    ▼
Text serialization → OpenAI text-embedding-ada-002
    │
    ▼
1536-dim vectors → INSERT INTO document_chunks (pgvector)

━━━━ PHASE 2: RETRIEVAL (at query time) ━━━━━━━━━━━━━━━━━━━━━━━━━

User Query → Embed with text-embedding-ada-002
    │
    ▼
pgvector approximate search → cosine_similarity() re-ranking
    │
    ▼
Top-3 most relevant chunks returned as context

━━━━ PHASE 3: GENERATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Context chunks + session history + user query
    │
    ▼
BusinessPromptManager assembles prompt
    │
    ▼
GPT-3.5-turbo → structured response with insights
```

### 7.2 Semantic Chunk Strategy

Rather than fixed-size text windows, each chunk represents a complete business domain, so retrieval returns semantically coherent context:

| Chunk Type | Content | Example |
|-----------|---------|---------|
| **Category** | Product × Region stats | "Widget A in North: 150 sales, avg satisfaction 3.2" |
| **Regional** | Revenue + satisfaction | "South region: $45,230 total, 3.4/5 satisfaction" |
| **Time-based** | Monthly trends | "January 2022: 210 transactions, 12% MoM growth" |
| **Product** | Per-product metrics | "Widget B: 28% market share, top performer in East" |

### 7.3 Cosine Similarity

```python
def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Applied during retrieval:
similarities = [cosine_similarity(query_emb, chunk.embedding) for chunk in all_chunks]
top_k = sorted(zip(similarities, chunks), reverse=True)[:3]
```

**Range:** −1 to +1. Scores above ~0.75 are considered highly relevant for this business domain.

---

## 8. Memory Integration

RouteRAG uses a **dual-layer memory architecture** so multi-turn conversations remain coherent across both short and long spans.

### 8.1 Short-Term Memory (Conversation Buffer)

Every user query and assistant response is persisted as a `Message` row linked to the active `ChatSession`. The last N messages are fetched and injected as `chat_history` into every new LLM prompt, enabling pronoun resolution and drill-down sequences.

```python
# Stored on every exchange:
Message(session_id=sid, role="user",      content=query)
Message(session_id=sid, role="assistant", content=answer)
```

### 8.2 Long-Term Memory (Session Summarization)

After each exchange, the system creates or updates a compressed LLM summary of the entire session stored in `session_summaries`. This prevents token-window overflow for long sessions while preserving key analytical context (products discussed, insights found, pending questions).

```python
existing_summary = await get_session_summary(session_id)
new_summary      = await llm.compress(existing_summary + new_messages)
await update_session_summary(session_id, new_summary)
```

### 8.3 Memory Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    MEMORY LAYERS                         │
│                                                          │
│  Short-Term (messages table)   Long-Term (summaries)     │
│  ┌──────────────────────┐      ┌─────────────────────┐   │
│  │ [msg 1] user         │      │ Compressed session  │   │
│  │ [msg 2] assistant    │─LLM─▶│ context snapshot    │   │
│  │ [msg 3] user         │compress                    │   │
│  │ [msg N] assistant    │      └──────────┬──────────┘   │
│  └──────────┬───────────┘                 │              │
│             └─────────────────┬───────────┘              │
│                               ▼                          │
│                    ┌─────────────────────┐               │
│                    │  Combined Context   │               │
│                    │  injected into LLM  │               │
│                    └─────────────────────┘               │
└──────────────────────────────────────────────────────────┘
```

### 8.4 Memory in Practice

| User Action | Memory Role |
|------------|-------------|
| "Which product did we discuss earlier?" | Short-term buffer recalls previous turn |
| Region → product → trend drill-down | Each step builds on accumulated context |
| Resuming a session later | Long-term summary preserves key findings |
| Long analysis spanning many queries | Summarization prevents prompt overflow |

---

## 9. LLM Orchestration & Prompt Engineering

### 9.1 Core Analysis Prompt Template

```
You are a business intelligence expert analyzing data metrics.

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

Response Format:
1. Key Findings:          [2-3 main insights]
2. Detailed Analysis:     [In-depth explanation]
3. Business Implications: [Strategic meaning]
4. Recommendations:       [Specific, actionable steps]
```

Three design principles make this effective:
- **Explicit role** — anchors the LLM's tone and domain expertise
- **Structured output format** — forces organized findings rather than freeform prose
- **Context injection** — retrieved chunks ground every answer in real data

### 9.2 System Prompts by Context

| Context | System Prompt |
|---------|--------------|
| RAG Query | "You are a business analytics assistant. Provide clear, data-driven responses." |
| Analysis Graph | "You are a business intelligence analyst. Use tools to analyze data and provide insights." |
| Evaluation | "You are an expert evaluator for a business intelligence AI assistant." |

### 9.3 Chain Architecture

| Chain | File | Memory |
|-------|------|--------|
| General analysis | `analysis_chain.py` | No |
| Business analysis with history | `business_analysis_chain.py` | Yes — ConversationBufferMemory |
| Chart type recommendation | `visualization_chain.py` | No |

### 9.4 Model Selection

| Task | Model | Rationale |
|------|-------|-----------|
| Deep analysis (LangGraph nodes) | GPT-4, temp=0.2 | Highest accuracy; deterministic outputs |
| RAG synthesis | GPT-3.5-turbo | Speed + cost balance for frequent queries |
| Evaluation scoring | GPT-3.5-turbo | Reliable structured output parsing |
| All embeddings | text-embedding-ada-002 | Standard, high-quality 1536-dim vectors |

---

## 10. Analytics Engine

### 10.1 Query Classification

Before any expensive operation runs, a keyword scan routes each query to the cheapest fitting handler:

```python
def classify_query(query: str) -> Literal["analytics", "chart", "rag"]:
    analytics_kw = ["total", "average", "sum", "trend", "compare", "top",
                    "by region", "by product", "sales", "revenue",
                    "how many", "count", "highest", "lowest"]
    chart_kw     = ["chart", "plot", "graph", "visualize", "show me"]

    q = query.lower()
    if any(kw in q for kw in chart_kw):     return "chart"
    if any(kw in q for kw in analytics_kw): return "analytics"
    return "rag"
```

| Query type | Handler | Typical latency |
|-----------|---------|----------------|
| Chart request | ChartEngine spec | <5ms |
| Aggregation / comparison | DuckDB SQL | <10ms |
| Open-ended / reasoning | RAG + LLM | 2–5s |

### 10.2 DuckDB SQL Analytics

Natural-language patterns are mapped to SQL templates and executed in DuckDB's in-memory engine:

```python
# "trend over time"  → GROUP BY Date ORDER BY Date
# "by product"       → GROUP BY Product
# "satisfaction"     → AVG(Customer_Satisfaction) GROUP BY Region
# "top N"            → ORDER BY Sales DESC LIMIT N
```

Results are formatted as conversational text before returning to the frontend.

### 10.3 Statistical Analysis Suite

All statistical measures computed with pandas + SciPy on the full dataset:

| Measure | Method | Business Use |
|---------|--------|-------------|
| Mean / Median | `df.mean()` / `df.median()` | Baseline benchmarks |
| Std Deviation | `df.std()` | Volatility / consistency |
| Skewness | `scipy.stats.skew()` | Detect revenue outlier bias |
| Kurtosis | `scipy.stats.kurtosis()` | Detect extreme value concentration |
| Q1 / Q3 / IQR | `df.quantile()` | Outlier detection range |

### 10.4 K-Means Customer Segmentation

```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

features = df.groupby('Customer_Age').agg(
    {'Sales': 'sum', 'Customer_Satisfaction': 'mean'}
).reset_index()

scaler  = StandardScaler()
X       = scaler.fit_transform(features[['Sales', 'Customer_Satisfaction']])
kmeans  = KMeans(n_clusters=3, random_state=42)
features['Segment'] = kmeans.fit_predict(X)
# Segments → Young (18–35) | Middle-aged (36–55) | Senior (56+)
```

---

## 11. Visualization System

### 11.1 Backend: ChartEngine (`backend/visualization/chart_engine.py`)

Supports 6 chart types, selected manually or via `get_chart_suggestions()` which inspects column types and recommends the most appropriate visualization:

| Chart Type | Best For | Auto-suggested when… |
|-----------|---------|----------------------|
| **Time Series** | Sales trends over time | Date column present |
| **Bar Chart** | Product / region comparisons | Categorical + numeric column |
| **Pie Chart** | Market share, distribution | Single categorical column |
| **Scatter Plot** | Correlation analysis | Two numeric columns |
| **Heatmap** | Region × Product matrices | Two categorical + one numeric |
| **Funnel Chart** | Stage progression / drop-off | Ordered stage data |

### 11.2 Frontend: Nivo Charts

Charts are rendered in React using `@nivo/bar` and `@nivo/line` (D3-backed SVG). The analytics dashboard renders six charts simultaneously from a single `/api/dashboard/metrics` response:

| Dashboard Chart | Type |
|----------------|------|
| Sales by Product | Bar |
| Satisfaction by Region | Bar |
| Sales by Region | Bar |
| Sales by Gender | Bar |
| Sales Trend Over Time | Time-series bar |
| Customer Age Distribution | Bar |

The Evaluation page adds: Sales Trends (line), Product Performance (bar), Regional Analysis (×2 bar), Customer Demographics (×2 bar).

### 11.3 Chat Response Rich Rendering

The `AssistantMessage` React component post-processes LLM text to detect and render structured data inline:

```javascript
const satisfactionPattern = /(\w+[\w\s]*)\s*[:–]\s*([\d.]+)\s*(?:out of|\/)\s*5/gi
const salesPattern        = /(\w+[\w\s]*)\s*[:–]\s*([\d,]+)\s*sales/gi
// → Renders ScoreBar (1–5 gauge) or Sales card instead of raw text
```

---

## 12. Model Evaluation & LLMOps

### 12.1 QAEvalChain Evaluator (`backend/evaluation/qa_eval.py`)

Each AI response can be scored against a ground truth across four business-relevant dimensions:

```python
class BusinessInsightEvaluator:
    async def evaluate_response(self, question, answer, ground_truth) -> EvaluationResult:
        # 1. Build rubric prompt with all three inputs
        # 2. Call GPT-3.5-turbo
        # 3. Parse 4 scores via regex
        # 4. Generate improvement recommendations
        # 5. Append to metrics_history
```

| Metric | Scale | Criteria |
|--------|-------|---------|
| **Accuracy** | 1–5 | Factual correctness vs. ground truth |
| **Completeness** | 1–5 | Coverage of all relevant aspects |
| **Relevance** | 1–5 | Direct address of the question asked |
| **Business Value** | 1–5 | Actionability and strategic utility |

**Thresholds:** < 3.0 → critical improvement area · < 4.0 → advisory · ≥ 4.0 → satisfactory

### 12.2 Evaluation Pipeline

```
POST /api/evaluate  { question, answer, ground_truth }
    │
    ▼
BusinessInsightEvaluator.evaluate_response()
    ├── Assemble rubric prompt
    ├── Call GPT-3.5-turbo
    ├── Parse scores: r"(accuracy|completeness|relevance|business_value):\s*(\d+)"
    ├── Identify improvement areas (threshold-based)
    └── Append to metrics_history
    │
    ▼
{
  metrics:           { accuracy: 4.2, completeness: 3.8, relevance: 4.5, business_value: 3.9 },
  feedback:          "The response demonstrates...",
  improvement_areas: ["Consider adding quantitative specifics..."]
}
```

### 12.3 Monitoring (`backend/evaluation/model_monitor.py`)

| Signal | Source |
|--------|--------|
| User ratings (1–5 stars) | `feedback` table |
| Per-session feedback text | `feedback` table |
| QAEvalChain score history | `metrics_history` in-memory list |
| Token usage | OpenAI callback per request |

Aggregation: `get_quality_summary()` returns averages across all evaluations; `get_performance_metrics()` returns a pandas DataFrame of score history.

---

## 13. API Reference

### 13.1 Endpoint Catalog

| Method | Endpoint | Purpose |
|--------|---------|---------|
| `POST` | `/api/query` | Classify → route → RAG/SQL/chart → respond |
| `GET` | `/api/analytics` | DuckDB SQL analytics query |
| `GET` | `/api/dashboard/metrics` | Summary metrics + 6 chart datasets |
| `GET` | `/api/chart/{metric_id}` | Generate chart spec for a saved metric |
| `POST` | `/api/upload` | Upload CSV/Excel data file |
| `GET` | `/api/session/{id}` | Retrieve session with full message history |
| `GET` | `/api/history` | List all sessions (newest first) |
| `POST` | `/api/feedback` | Submit star rating + feedback text |
| `GET` | `/api/feedback/{session_id}` | Retrieve all feedback for a session |
| `POST` | `/api/evaluate` | Run QAEvalChain evaluation |

### 13.2 `POST /api/query` — Primary Query Endpoint

**Request:**
```json
{ "query": "What are the top-performing products by region?", "session_id": "uuid-optional" }
```

**Response:**
```json
{
  "answer": "Widget B leads in the East region with 28% market share...",
  "citations": ["Regional summary chunk", "Product analysis chunk"],
  "chart_spec": { "type": "bar", "data": [...], "title": "..." },
  "follow_up_questions": ["What is Widget B's satisfaction score in the East?"],
  "session_id": "uuid-generated",
  "type": "rag"
}
```

### 13.3 `GET /api/dashboard/metrics`

**Response:**
```json
{
  "total_sales": 125430.50,
  "avg_satisfaction": 3.12,
  "total_products": 4,
  "regions": ["North", "South", "East", "West"],
  "charts": {
    "sales_by_product":      [{ "product": "Widget A", "sales": 31245 }],
    "satisfaction_by_region": [{ "region": "North", "avg_satisfaction": 3.4 }],
    "age_distribution":       [{ "age_group": "18-30", "count": 621 }],
    "sales_trend":            [{ "date": "2022-01-01", "sales": 450.2 }]
  },
  "data_source": "uploaded"
}
```

---

## 14. Frontend Architecture

### 14.1 Page Structure

| Page | Route | Key Components | Data Source |
|------|-------|---------------|-------------|
| Home | `/` | Hero, feature cards, tech stack pills | Static |
| Chat | `/chat` | File dropzone, message thread, rich renderer | `/api/query` |
| Analytics | `/analytics` | 4 KPI cards, 6 Nivo charts | `/api/dashboard/metrics` |
| History | `/history` | Session table, search bar, feedback modal | `/api/history` |
| Evaluation | `/evaluation` | QAEvalChain tester + 5 visualization sections | `/api/evaluate` |
| Session Detail | `/session/[id]` | Full message history + AI summary | `/api/session/{id}` |

### 14.2 Design System

| Token | Value |
|-------|-------|
| Background | `hsl(0, 0%, 4%)` — near-black |
| Card surface | `hsl(0, 0%, 10%)` |
| Body text | `hsl(0, 0%, 95%)` — near-white |
| Muted text | `hsl(0, 0%, 55%)` |
| Accent Blue | `blue-400/500` |
| Accent Violet | `violet-400/500` |
| Accent Green | `emerald-400/500` |
| Borders | `border-white/10` |

Dark theme with blue/violet/emerald accents — intentionally resembles professional BI tools to feel familiar to business users.

---

## 15. Configuration & Deployment

### 15.1 Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql+psycopg2://user:pass@localhost:5432/routerag` |
| `OPENAI_API_KEY` | OpenAI authentication | `sk-...` |
| `OPENAI_BASE_URL` | API endpoint (proxy-friendly) | `https://openai.vocareum.com/v1` |

### 15.2 Python Dependencies

```
fastapi  uvicorn  sqlalchemy  alembic  psycopg2-binary  pgvector
langchain  langchain-openai  langgraph  openai
pandas  numpy  scipy  scikit-learn  duckdb
python-multipart  pydantic
```

### 15.3 Deployment Steps

```bash
# 1. Python environment
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. Database setup
createdb routerag
cd backend && alembic upgrade head

# 3. Environment variables
cp backend/.env.example backend/.env
# Set DATABASE_URL and OPENAI_API_KEY

# 4. Frontend dependencies
cd ../frontend && npm install

# 5. Start all services
./run_all.sh
# Backend  → http://localhost:9100
# Frontend → http://localhost:3000
# API docs → http://localhost:9100/docs
```

---

## 16. Performance Characteristics

### 16.1 Latency by Operation

| Operation | Typical Latency | Notes |
|-----------|----------------|-------|
| Query embedding | ~200ms | OpenAI API round-trip |
| pgvector similarity search | ~5ms | Index-assisted |
| Cosine re-ranking (top-3) | <1ms | NumPy in-memory |
| DuckDB SQL (2,501 rows) | <10ms | In-memory OLAP |
| Pandas aggregation | <50ms | Full dataset scan |
| K-means clustering | <100ms | Single fit, 3 clusters |
| GPT-3.5 RAG generation | 2–5s | Varies with response length |
| GPT-4 deep analysis | 5–15s | Higher quality, slower |

Most conversational queries complete in under 5 seconds end-to-end.

### 16.2 Scalability Considerations

| Component | Bottleneck | Mitigation |
|-----------|-----------|-----------|
| OpenAI API | Rate limits, latency | Response caching, async parallel calls |
| pgvector search | Grows linearly with chunk count | IVFFlat index for large corpora |
| DuckDB | Memory-bound | Partition or stream large CSVs |
| Session memory | Long conversations increase prompt size | Periodic summarization (already implemented) |

---

## Appendix A: Supported Analysis Types

| Analysis Type | Example Trigger | Output |
|--------------|----------------|--------|
| Sales Trend | "What is the sales trend over time?" | Time-series with growth rates |
| Product Performance | "Which product performs best?" | Ranked table with market share |
| Regional Analysis | "Compare performance by region" | Regional metrics + heatmap |
| Customer Segmentation | "Tell me about customer demographics" | K-means cluster profiles |
| Satisfaction Analysis | "What is the average satisfaction?" | Scores by region/product/segment |
| Statistical Summary | "Give me statistical measures for sales" | Mean, median, std, skew, kurtosis |

## Appendix B: Evaluation Preset Questions

| Preset | Question | Tests |
|--------|---------|-------|
| #1 | "What is the sales trend over time?" | Time-series analysis accuracy |
| #2 | "Which product has the best performance?" | Product comparison completeness |
| #3 | "What is the average customer satisfaction?" | Aggregation correctness |

---

*Technical Document — RouteRAG · April 2026*

---
---

# Part 2 — Blog Post

# Building RouteRAG: A Conversational BI Assistant with LangChain, RAG, and LLMs

*From raw CSV data to natural-language insights — the architecture decisions, lessons learned, and why each choice matters.*

---

## The Problem: Data Rich, Insight Poor

Every business generates data. Sales records, customer demographics, regional performance, product metrics — the numbers accumulate in spreadsheets and databases month after month. Yet for most small and medium-sized businesses, that data just sits there.

Extracting meaningful insights has traditionally required:
- A dedicated analyst (expensive and slow)
- A BI platform like Tableau or Power BI (steep learning curve)
- Custom reporting scripts (technical barrier, ongoing maintenance)

What if a business owner could simply *ask* their data — *"Which product is performing best in the South region?"* — and get a clear, accurate, actionable answer in seconds?

That's exactly what **RouteRAG** was built to solve.

---

## What Is RouteRAG?

RouteRAG is a conversational Business Intelligence Assistant that combines:

- **LangChain** — to orchestrate LLM workflows and retrieval chains
- **Retrieval-Augmented Generation (RAG)** — to ground every response in real business data
- **OpenAI GPT-4 / GPT-3.5** — for natural language understanding and generation

You upload your sales CSV, ask questions in plain English, and receive structured insights with supporting statistics and visualizations — no SQL, no code required.

---

## How It Works: The Architecture

The system is deliberately layered. Every query passes through a smart router before touching the LLM, ensuring the cheapest appropriate tool handles each request:

```
User (Browser)
      │
      ▼
Next.js Frontend  (React + Tailwind + Nivo Charts)
      │
      ▼
FastAPI Backend
      │
      ├── Query Router ──► chart keywords?    → ChartEngine
      │                ──► analytics keywords? → DuckDB SQL
      │                ──► open-ended?         → RAG + LLM
      │
      ├── RAG Pipeline  (embed → pgvector → GPT-3.5)
      ├── LangGraph     (4-node GPT-4 analysis workflow)
      ├── BusinessAnalyzer (Pandas + scikit-learn + SciPy)
      └── Dual-layer Memory (PostgreSQL short-term + summaries)
```

This division of labor is the core architectural insight: **LLMs are synthesizers and communicators, not databases or calculators.** Let DuckDB handle SQL. Let scikit-learn cluster. Let the LLM do what it does best — understand intent and communicate insights.

---

## Building the Knowledge Base

The first design challenge: *how do you make a CSV retrievable by an LLM?*

Dumping raw rows into a prompt doesn't scale. Instead, RouteRAG uses **semantic chunking by business domain** — when a file is uploaded, the RAG Manager segments the data into four meaning-complete summary types before embedding and storing them in pgvector:

| Chunk Type | Represents |
|-----------|------------|
| Category | Product × Region cross-tabulation statistics |
| Regional | Total revenue and satisfaction per region |
| Time-based | Monthly and weekly aggregated trends |
| Product | Per-product performance and market share |

Each chunk carries *business intent*, not just text. A query about "East region performance" retrieves the chunk built specifically for that context — not a random fragment. This precision is what makes the RAG system reliable rather than noisy.

---

## The Smart Query Router

One of the highest-ROI decisions was building a **three-way router** that intercepts queries before any LLM call:

- **"Show me a sales chart"** → ChartEngine returns a spec in <5ms (zero LLM cost)
- **"What is total sales by region?"** → DuckDB SQL executes in <10ms (zero LLM cost)
- **"Why might the South be underperforming?"** → Full RAG + LLM (nuanced reasoning needed)

This alone reduces API costs and latency dramatically on the majority of queries, which tend to be structured aggregations rather than open-ended reasoning.

---

## Memory: Making Conversations Coherent

A one-shot Q&A tool isn't a real BI assistant. Real analysis is iterative — you start broad, then drill down, compare, and follow up. RouteRAG maintains two memory layers to support this:

**Short-term memory** persists every message in PostgreSQL and injects the last N exchanges as `chat_history` into each new prompt. This enables natural pronoun resolution:

```
User: "What are sales in the North region?"
AI:   "North had $45,230 in total sales..."
User: "How does that compare to South?"
AI:   [Resolves "that" correctly] "Compared to North's $45,230, South had $38,100..."
```

**Long-term memory** prevents context overflow in extended sessions. After each exchange, a compressed LLM summary of the session is written to `session_summaries`, preserving key insights — products of interest, questions raised, trends discovered — without replaying the full message history.

This is the same principle behind ChatGPT's persistent memory: compress what matters, discard what doesn't.

---

## Prompt Engineering That Works

Getting reliable business insights out of an LLM requires disciplined prompt design. The core analysis template enforces a consistent, actionable structure:

```
You are a business intelligence expert analyzing data metrics.

Available Metrics: {context}
User Question:     {question}
Previous Conversation: {chat_history}

Respond with:
1. Key Findings:          2–3 main insights
2. Detailed Analysis:     In-depth explanation
3. Business Implications: Strategic meaning
4. Recommendations:       Specific, actionable steps
```

Three things make this work:
1. **Explicit expert role** — anchors domain tone and prevents vague responses
2. **Mandatory output structure** — forces organized findings over freeform prose
3. **Injected context** — retrieved chunks ensure every answer is grounded in actual data

---

## Measuring Quality with QAEvalChain

Building the system is only half the work. Knowing whether it's *good* requires an evaluation framework.

RouteRAG implements a QAEvalChain-style evaluator that scores responses across four dimensions (each 1–5) using GPT-3.5-turbo as the judge:

| Dimension | What It Measures |
|-----------|-----------------|
| Accuracy | Factual correctness vs. ground truth |
| Completeness | Coverage of all relevant aspects |
| Relevance | How directly it addresses the question |
| Business Value | Actionability and strategic utility |

Scores below 3.0 are flagged as critical; below 4.0 as advisory. This creates a continuous improvement loop — every poor-scoring response points to a specific, fixable gap.

---

## Key Lessons Learned

**1. Smart routing beats universal RAG.**
Not every question deserves an LLM call. Routing simple aggregations to DuckDB SQL cuts latency by ~95% for those queries with no quality loss.

**2. Domain-semantic chunking beats fixed-size windows.**
Chunks that represent complete business domains (a region's metrics, a product's performance) retrieve far more precisely than arbitrary 512-token text slices. The chunk carries *intent*.

**3. Temperature matters more than model version.**
GPT-4 at temperature=0.2 for analysis; GPT-3.5 at temperature=0.3 for generation. The low temperature is what delivers factual accuracy — the model version matters less than the temperature setting for deterministic BI output.

**4. Memory is what separates Q&A from analysis.**
Users naturally ask multi-turn questions. Without persistent memory, every exchange is context-free. The dual-layer architecture — short-term buffer plus long-term summaries — is what makes RouteRAG feel like a genuine analyst rather than a chatbot.

**5. Evaluation is not an afterthought.**
Without a scoring framework, there's no feedback loop. Building QAEvalChain in from the start created a reliable signal for where the system was failing and why.

**6. Structured prompts beat longer prompts.**
The four-section output format (Findings → Analysis → Implications → Recommendations) consistently outperforms longer unstructured prompts. Business users need organized conclusions, not essays.

---

## What's Next for RouteRAG

The current system handles structured CSV data reliably. Natural extensions:

- **Multi-format ingestion** — Excel, JSON, live database connections
- **Predictive analytics** — Time-series forecasting with Prophet or statsmodels
- **Alerts** — Proactive notifications when metrics cross defined thresholds
- **Export layer** — PDF report generation from conversation sessions
- **Collaborative sessions** — Multi-user analysis on shared datasets
- **Fine-tuned models** — Domain-specific LLM fine-tuning for vertical industries

---

## Try It Yourself

```bash
git clone <repo> && cd BusinessAnalytics

# Backend
pip install -r requirements.txt
cd backend && alembic upgrade head

# Frontend
cd ../frontend && npm install

# Configure (add OPENAI_API_KEY)
cp backend/.env.example backend/.env

# Launch
./run_all.sh
# → http://localhost:3000
```

Upload `sample_sales_data.csv`, open `/chat`, and ask:
> *"What are the key trends in our sales data?"*
> *"Which product has the highest customer satisfaction?"*
> *"Compare performance across North and South regions."*

---

## Conclusion

RouteRAG shows that combining RAG, LLMs, and classical analytics tools solves a real-world problem: making business intelligence accessible without enterprise budgets or dedicated data teams.

The key insight: each technology does what it does best. DuckDB handles SQL. scikit-learn handles clustering. The LLM handles intent understanding and communication. Memory makes it conversational. Evaluation makes it trustworthy. Structured prompting makes it actionable.

That division of responsibility — not a single monolithic LLM call for everything — is what transforms a language model into a genuine business intelligence assistant.

---

*Built with LangChain · RAG · OpenAI GPT-4 · FastAPI · Next.js · April 2026*
