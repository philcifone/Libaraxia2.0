import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

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
      // Using the full URL
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
      console.log('Search results:', data); // Debug log
      setResults(data.items || []);
    } catch (err) {
      console.error('Search error:', err); // Debug log
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
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((book) => (
          <div 
            key={book.id} 
            onClick={() => navigate(`/books/${book.id}`)}
            className="cursor-pointer border rounded-lg p-4 hover:shadow-lg transition duration-200"
          >
            <div className="aspect-w-2 aspect-h-3 mb-4">
              <img
                src={book.volumeInfo.imageLinks?.thumbnail || '/placeholder-book.png'}
                alt={book.volumeInfo.title}
                className="object-cover rounded-md"
              />
            </div>
            <h3 className="font-semibold text-lg mb-2">{book.volumeInfo.title}</h3>
            <p className="text-sm text-gray-600">
              {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
            </p>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && query && (
        <p className="text-center text-gray-600">No books found. Try a different search.</p>
      )}
    </div>
  );
}