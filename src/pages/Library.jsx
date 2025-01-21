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

  const handleBookClick = (event, googleBooksId) => {
    if (event.target.tagName.toLowerCase() === 'select') {
      return;
    }
    navigate(`/books/${googleBooksId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          phil's Library
        </h1>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground border border-border/40 [&>option]:bg-secondary"
        >
          <option value="all">All Books</option>
          <option value="currently reading">Currently Reading</option>
          <option value="want to read">Want to Read</option>
          <option value="read">Read</option>
          <option value="did not finish">Did Not Finish</option>
        </select>
      </div>

      {/* Empty state */}
      {error ? (
        <div className="bg-secondary/50 border border-border/40 rounded-lg p-4">
          <p className="text-foreground text-center">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="border border-border/40 rounded-lg p-8 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Your library is empty
          </h2>
          <p className="text-muted-foreground mb-4">
            Start adding books to your library to keep track of your reading journey.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors duration-200"
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
              className="group border border-border/40 rounded-lg overflow-hidden cursor-pointer"
            >
              <div className="aspect-[2/3] relative overflow-hidden">
                <img
                  src={book.cover_image_url || '/placeholder-book.png'}
                  alt={book.title}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-foreground line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {book.author}
                </p>

                <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={book.status}
                    onChange={(e) => updateBookStatus(book.id, e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground border border-border/40 cursor-pointer [&>option]:bg-secondary"
                  >
                    <option value="currently reading">Currently Reading</option>
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
