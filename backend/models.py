# RouteRAG Backend Models (SQLAlchemy)
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class ChatSession(Base):
    __tablename__ = 'chat_sessions'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    title = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    user = relationship('User')

class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('chat_sessions.id'))
    role = Column(String(32))
    content = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    session = relationship('ChatSession')

class SessionSummary(Base):
    __tablename__ = 'session_summaries'
    session_id = Column(Integer, ForeignKey('chat_sessions.id'), primary_key=True)
    summary = Column(Text)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    session = relationship('ChatSession')

class BusinessDocument(Base):
    __tablename__ = 'business_documents'
    id = Column(Integer, primary_key=True)
    source_type = Column(String(64))
    title = Column(String(255))
    raw_content = Column(Text)
    metadata_json = Column(JSONB)
    created_at = Column(DateTime, server_default=func.now())

class DocumentChunk(Base):
    __tablename__ = 'document_chunks'
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey('business_documents.id'))
    chunk_text = Column(Text)
    chunk_index = Column(Integer)
    embedding = Column(String)  # Placeholder for vector type
    metadata_json = Column(JSONB)
    document = relationship('BusinessDocument')

class BusinessMetric(Base):
    __tablename__ = 'business_metrics_catalog'
    id = Column(Integer, primary_key=True)
    metric_name = Column(String(255))
    definition = Column(Text)
    formula = Column(Text)
    owner = Column(String(255))
    refresh_frequency = Column(String(64))

class SalesRecord(Base):
    __tablename__ = 'sales_records'
    id = Column(Integer, primary_key=True)
    order_date = Column(DateTime)
    region = Column(String(64))
    product_id = Column(Integer)
    customer_id = Column(Integer)
    revenue = Column(Numeric)
    quantity = Column(Integer)
    channel = Column(String(64))

class Product(Base):
    __tablename__ = 'products'
    product_id = Column(Integer, primary_key=True)
    product_name = Column(String(255))
    category = Column(String(64))
    price_band = Column(String(64))

class Customer(Base):
    __tablename__ = 'customers'
    customer_id = Column(Integer, primary_key=True)
    segment = Column(String(64))
    geography = Column(String(64))
    demographic_group = Column(String(64))

class Feedback(Base):
    __tablename__ = 'feedback'
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey('chat_sessions.id'), nullable=False)
    message_id = Column(Integer, ForeignKey('messages.id'), nullable=True)
    rating = Column(Integer, nullable=False)
    feedback_text = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    session = relationship('ChatSession')
    message = relationship('Message')

