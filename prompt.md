I'm forking and deeply studying a GitHub repo called "InsightForge" (AI-Powered Business Intelligence Assistant) from https://github.com/nselvar/AIBusinessAnalytics so I can present it as a genuinely-understood, substantially-extended project for a job application (Analytics & AI Engineer intern at Honasa Consumer / Mamaearth). I need to be able to explain every architectural decision in an interview, not just run it.

Do the following, in order:

1. Clone the repo and get it running end-to-end locally. Walk me through any setup friction (pgvector extension, migrations, env vars, API keys) rather than silently working around it — I need to understand the real setup, since I'll likely be asked about deployment/config in interviews.

   IMPORTANT — API provider change: this repo is built around the OpenAI API (OPENAI_API_KEY, GPT-4/GPT-3.5-turbo for generation, text-embedding-ada-002 for embeddings, via langchain-openai). I will be using the Gemini API instead, not OpenAI. Before writing any feature code, find and list every place in the codebase that assumes OpenAI specifically, including but not limited to:
   - `backend/.env` / `backend/.env.example` — OPENAI_API_KEY, OPENAI_BASE_URL
   - Any `from langchain_openai import ...` or `import openai` statements (rag_manager.py, analysis_graph.py, qa_eval.py, business_prompts.py, and any chain files)
   - The embedding calls tied to `text-embedding-ada-002` (1536-dim) — note that Gemini's embedding model has a different dimension size, so check `document_chunks.embedding` column definition in the PostgreSQL/pgvector schema and any Alembic migration that sets the vector dimension, since this will need to change
   - `get_openai_callback()` usage for token tracking (OpenAI-specific; there's no direct Gemini equivalent, so flag this and propose an alternative, e.g. manual token counting or dropping this feature)
   - Any hardcoded model name strings ("gpt-4", "gpt-3.5-turbo") in prompts, chains, or the LangGraph nodes

   Then migrate the project to use Gemini instead of OpenAI:
   - Use `langchain-google-genai` (ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings) in place of the OpenAI equivalents
   - Pick appropriate Gemini models for the two roles the repo currently splits across GPT-4/GPT-3.5 (a stronger model for the LangGraph deep-analysis nodes at low temperature, a faster/cheaper model for RAG synthesis and evaluation scoring) — tell me which Gemini models you're choosing and why
   - Update the embedding dimension everywhere it's referenced (schema, migration, any hardcoded "1536") to match the Gemini embedding model's actual output dimension
   - Rename `OPENAI_API_KEY`/`OPENAI_BASE_URL` to a clear Gemini equivalent (e.g. `GOOGLE_API_KEY`) in `.env.example`, `.env`, and wherever they're read in code
   - Confirm the app still runs end-to-end after the swap — ingest the sample CSV, ask a few queries, and check that RAG retrieval, the LangGraph analysis workflow, and the QAEvalChain evaluator all still produce sensible output with Gemini
   - Tell me plainly if any feature degrades or behaves differently under Gemini (e.g., different structured-output reliability, rate limits, latency) so I understand the real tradeoffs I'm taking on, rather than assuming it's a drop-in swap

2. Read these core files first and produce a plain-English explanation of each, as if teaching me:
   - backend/llm/rag_manager.py (the RAG pipeline: embed → retrieve → generate)
   - backend/llm/business_retriever.py (custom LangChain BaseRetriever with domain-specific chunk extraction)
   - backend/llm/analysis_graph.py (the 4-node LangGraph workflow)
   - backend/analysis/business_analyzer.py (pandas/sklearn analytics engine)
   - backend/evaluation/qa_eval.py (QAEvalChain-style evaluator)
   For each file: what problem it solves, why it's built this way instead of simpler alternatives, and what would break if I removed it.

3. Produce a single architecture diagram (text/ASCII is fine) tracing one query end-to-end: user types a question in the Chat UI → query classification → router decision (chart/SQL/RAG) → relevant backend module → LLM call (if any) → response → frontend rendering. I want to be able to redraw this from memory.

4. List the 10 most likely interview questions a technical interviewer would ask about this project (e.g., "why semantic chunking over fixed-size chunks," "why pgvector over a dedicated vector DB," "how does memory prevent context overflow," "what's the cost tradeoff in the query router") and draft strong, honest answers for each, grounded in the actual code, not generic RAG theory.

5. Swap the sample dataset (sample_sales_data.csv) for a different one — I'll bring a D2C/retail/e-commerce sales dataset. Re-run ingestion and confirm chunks, charts, and RAG answers reflect the new domain correctly end-to-end (upload → embed → query → chart).

6. Do NOT make any feature additions yet — that's a separate step I'll prompt for once I've understood the base system. For now, just get me to a state where I deeply understand and can run the existing system, and flag anything in the code that looks fragile, hacky, or like it wouldn't survive a skeptical code review (e.g., regex-based score parsing in qa_eval.py, keyword-based query classification) — I want to know the real weaknesses, not just the selling points, since I may want to fix one of them as my differentiating contribution.

Be honest and specific throughout — if something in the repo doesn't actually work, is overstated in its own README, or is more fragile than it looks, tell me plainly rather than smoothing it over.
