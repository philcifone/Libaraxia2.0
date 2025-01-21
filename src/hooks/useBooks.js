import { useState, useCallback } from 'react';
import { bookService } from '../services/books';

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async (userId) => {
    setLoading(true);
    try {
      const data = await bookService.getUserBooks(userId);
      setBooks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { books, loading, error, fetchBooks };
}