// services/books.js
import axios from 'axios';

const GOOGLE_BOOKS_API_KEY = 'AIzaSyCMV_j4smI0KR2qboQ0HDOj0d0JxUmQT4I';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1';

// Create an axios instance for Google Books API
const googleBooksApi = axios.create({
  baseURL: GOOGLE_BOOKS_API_URL
});

// Create an axios instance for your backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const booksService = {
  // Search books from Google Books API
  async searchBooks(query, startIndex = 0) {
    try {
      const { data } = await googleBooksApi.get('/volumes', {
        params: {
          q: query,
          startIndex,
          maxResults: 12,
          key: GOOGLE_BOOKS_API_KEY
        }
      });
      return data;
    } catch (error) {
      throw new Error('Failed to search books');
    }
  },

  // Get a single book's details from Google Books
  async getBookDetails(bookId) {
    try {
      const { data } = await googleBooksApi.get(`/volumes/${bookId}`, {
        params: {
          key: GOOGLE_BOOKS_API_KEY
        }
      });
      return data;
    } catch (error) {
      throw new Error('Failed to fetch book details');
    }
  },

  // Add a book to user's library (this will call your backend)
  async addToLibrary(bookData) {
    try {
      const { data } = await api.post('/books', bookData);
      return data;
    } catch (error) {
      throw new Error('Failed to add book to library');
    }
  },

  // Get user's library (this will call your backend)
  async getUserLibrary() {
    try {
      const { data } = await api.get('/books');
      return data;
    } catch (error) {
      throw new Error('Failed to fetch library');
    }
  },

  // Remove a book from user's library (this will call your backend)
  async removeFromLibrary(bookId) {
    try {
      await api.delete(`/books/${bookId}`);
    } catch (error) {
      throw new Error('Failed to remove book from library');
    }
  }
}