import React, { useState, Suspense } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send } from 'lucide-react';
import BarChart from '../charts/BarChart';
import { Loading } from '../ui/loading';

export function NLQAnalytics() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Natural Language Analytics</Card.Title>
        <Card.Description>Ask questions about your data in plain English</Card.Description>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Show me average customer satisfaction by product"
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {loading && <Loading />}

        {loading && (
          <div className="mt-4 text-center text-muted-foreground">
            Analyzing your question...
          </div>
        )}

        {result && (
          <div className="mt-4">
            <div className="prose">
              <p>{result.answer}</p>
            </div>
            <div className="mt-4">
              {/* Automatic chart based on data type */}
              {result.result && result.result.length > 0 && (
                <div className="mt-4 border rounded-lg p-4">
                  <BarChart data={result.result} />
                </div>
              )}
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}