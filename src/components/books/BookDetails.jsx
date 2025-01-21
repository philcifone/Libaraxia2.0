import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Loader } from 'lucide-react';

export default function BookDetails() {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToLibrary, setAddingToLibrary] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}?key=AIzaSyCMV_j4smI0KR2qboQ0HDOj0d0JxUmQT4I`);
        if (!response.ok) throw new Error('Book not found');
        const data = await response.json();
        setBook(data);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleAddToLibrary = async () => {
    setAddingToLibrary(true);
    try {
      const response = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors,
          description: book.volumeInfo.description,
          thumbnail: book.volumeInfo.imageLinks?.thumbnail,
          publishedDate: book.volumeInfo.publishedDate,
          googleBooksId: book.id,
          categories: book.volumeInfo.categories
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add book');
      }
      
      navigate('/library');
    } catch (err) {
      console.error('Error adding book:', err);
      setError('Failed to add book to library');
    } finally {
      setAddingToLibrary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-center font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-center text-gray-600 font-medium">Book not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Book Cover Column */}
          <div className="md:col-span-4 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-100">
            <div className="w-48 h-72 rounded-lg overflow-hidden shadow-lg">
              <img
                src={book.volumeInfo.imageLinks?.thumbnail || '/placeholder-book.png'}
                alt={book.volumeInfo.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="mt-6 w-full">
              <button
                onClick={handleAddToLibrary}
                disabled={addingToLibrary}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm hover:shadow"
              >
                {addingToLibrary ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {addingToLibrary ? 'Adding...' : 'Add to Library'}
              </button>
            </div>
          </div>

          {/* Book Details Column */}
          <div className="md:col-span-8 p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.volumeInfo.title}
                </h1>
                <p className="text-xl text-gray-600">
                  By {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Published: {book.volumeInfo.publishedDate ? 
                    new Date(book.volumeInfo.publishedDate).getFullYear() : 
                    'Unknown'}
                </p>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {book.volumeInfo.description || 'No description available.'}
                </p>
              </div>

              {book.volumeInfo.categories && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Categories
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {book.volumeInfo.categories.map((category) => (
                      <span
                        key={category}
                        className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}