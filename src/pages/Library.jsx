import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader, BookOpen } from 'lucide-react';

export default function Library() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/books', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load your library');
    } finally {
      setLoading(false);
    }
  };

  const updateBookStatus = async (bookId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/books/${bookId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update book status');
      }

      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.id === bookId ? { ...book, status: newStatus } : book
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filteredBooks =
    filter === 'all' ? books : books.filter((book) => book.status === filter);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );
  }

  const handleBookClick = (event, googleBooksId) => {
    if (event.target.tagName.toLowerCase() === 'select') {
      return;
    }
    navigate(`/books/${googleBooksId}`);
  };

  return (
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user.username}'s Library
          </h1>

          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Books</option>
              <option value="currently reading">Currently Reading</option>
              <option value="want to read">Want to Read</option>
              <option value="read">Read</option>
              <option value="did not finish">Did Not Finish</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your library is empty
            </h2>
            <p className="text-gray-600 mb-4">
              Start adding books to your library to keep track of your reading journey.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Find Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={(e) => handleBookClick(e, book.isbn)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer"
              >
                <div className="aspect-w-3 aspect-h-4 bg-gray-100">
                  <img
                    src={book.cover_image_url || '/placeholder-book.png'}
                    alt={book.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{book.author}</p>

                  <div
                    className="space-y-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={book.status}
                      onChange={(e) => updateBookStatus(book.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    >
                      <option value="currently reading">
                        Currently Reading
                      </option>
                      <option value="want to read">Want to Read</option>
                      <option value="read">Read</option>
                      <option value="did not finish">Did Not Finish</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
