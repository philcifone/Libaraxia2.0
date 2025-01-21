import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader } from 'lucide-react';

export default function BookSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/books/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }
      
      const data = await response.json();
      setResults(data.items || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search books');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books..."
            className="w-full px-4 py-2 pl-10 bg-card text-card-foreground border border-border/40 rounded-lg focus:ring-2 focus:ring-foreground/20 focus:border-foreground/20 placeholder:text-muted-foreground"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {error && (
        <div className="bg-secondary/50 border border-border/40 rounded-lg p-4 mb-4">
          <p className="text-foreground text-center">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((book) => (
          <div 
            key={book.id} 
            onClick={() => navigate(`/books/${book.id}`)}
            className="group cursor-pointer bg-card border border-border/40 rounded-lg p-4 hover:border-foreground/20 transition duration-200"
          >
            <div className="aspect-w-2 aspect-h-3 mb-4 overflow-hidden rounded-md">
              <img
                src={book.volumeInfo.imageLinks?.thumbnail || '/placeholder-book.png'}
                alt={book.volumeInfo.title}
                className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <h3 className="font-semibold text-lg text-card-foreground mb-2">
              {book.volumeInfo.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
            </p>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && query && (
        <p className="text-center text-muted-foreground">No books found. Try a different search.</p>
      )}
    </div>
  );
}