import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE;

export function useFetch(path, { method = 'GET', body, token, skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = res.status === 204 ? null : await res.json();
      setData(json);
      return json;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [path, method, body, token]);

  useEffect(() => {
    if (!skip) run();
  }, [skip]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: run };
}
