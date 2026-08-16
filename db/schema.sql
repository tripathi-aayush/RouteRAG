-- RouteRAG PostgreSQL Schema (MVP)

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(id),
    role VARCHAR(32),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_summaries (
    session_id INTEGER PRIMARY KEY REFERENCES chat_sessions(id),
    summary TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE business_documents (
    id SERIAL PRIMARY KEY,
    source_type VARCHAR(64),
    title VARCHAR(255),
    raw_content TEXT,
    metadata_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE document_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES business_documents(id),
    chunk_text TEXT,
    chunk_index INTEGER,
    embedding VECTOR(768),
    metadata_json JSONB
);

CREATE TABLE business_metrics_catalog (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(255),
    definition TEXT,
    formula TEXT,
    owner VARCHAR(255),
    refresh_frequency VARCHAR(64)
);

CREATE TABLE sales_records (
    id SERIAL PRIMARY KEY,
    order_date DATE,
    region VARCHAR(64),
    product_id INTEGER,
    customer_id INTEGER,
    revenue NUMERIC,
    quantity INTEGER,
    channel VARCHAR(64)
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    category VARCHAR(64),
    price_band VARCHAR(64)
);

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    segment VARCHAR(64),
    geography VARCHAR(64),
    demographic_group VARCHAR(64)
);

