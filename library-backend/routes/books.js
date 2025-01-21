const express = require('express');
const router = express.Router();
const axios = require('axios');

module.exports = function(db, authenticateToken) {
  // Get user's library
  router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;
    db.all(`
      SELECT b.*, c.status 
      FROM books b
      JOIN collections c ON b.id = c.book_id
      WHERE c.user_id = ?
    `, [userId], (err, books) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(books);
    });
  });

  // Search Google Books
  router.get('/search', authenticateToken, async (req, res) => {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    try {
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q,
          key: process.env.GOOGLE_BOOKS_API_KEY || 'AIzaSyCMV_j4smI0KR2qboQ0HDOj0d0JxUmQT4I'
        }
      });

      res.json(response.data);
    } catch (error) {
      console.error('Google Books API error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to search books' });
    }
  });

// Add a book to library
router.post('/', authenticateToken, async (req, res) => {
    const { 
      title, 
      authors, 
      description, 
      thumbnail,
      publishedDate,
      googleBooksId,
      categories 
    } = req.body;
  
    // Input validation with specific error messages
    if (!title) {
      return res.status(400).json({ error: 'Book title is required' });
    }
    if (!googleBooksId) {
      return res.status(400).json({ error: 'Google Books ID is required' });
    }
  
    let transaction;
    try {
      // Start transaction
      transaction = true;
      await db.run('BEGIN TRANSACTION');
  
      // Check if book exists with better error handling
      const existingBook = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM books WHERE isbn = ? OR title = ?', [googleBooksId, title], (err, book) => {
          if (err) reject(new Error('Database error while checking existing book'));
          else resolve(book);
        });
      });
  
      let bookId;
      
      if (existingBook) {
        bookId = existingBook.id;
        // Update existing book with new information
        await new Promise((resolve, reject) => {
          db.run(`
            UPDATE books 
            SET description = COALESCE(?, description),
                cover_image_url = COALESCE(?, cover_image_url),
                author = COALESCE(?, author),
                genre = COALESCE(?, genre)
            WHERE id = ?
          `, [
            description,
            thumbnail,
            Array.isArray(authors) ? authors.join(', ') : authors,
            Array.isArray(categories) ? categories.join(', ') : categories,
            bookId
          ], (err) => {
            if (err) reject(new Error('Failed to update book information'));
            else resolve();
          });
        });
      } else {
        // Insert new book
        const result = await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO books (
              title, 
              author, 
              description, 
              cover_image_url,
              publish_year,
              isbn,
              genre
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            title,
            Array.isArray(authors) ? authors.join(', ') : authors,
            description || '',
            thumbnail || '',
            publishedDate ? new Date(publishedDate).getFullYear() : null,
            googleBooksId,
            Array.isArray(categories) ? categories.join(', ') : categories
          ],
          function(err) {
            if (err) reject(new Error('Failed to insert new book'));
            else resolve(this.lastID);
          });
        });
        
        bookId = result;
      }
  
      // Check if already in collection
      const existingCollection = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM collections WHERE user_id = ? AND book_id = ?',
          [req.user.id, bookId],
          (err, existing) => {
            if (err) reject(new Error('Failed to check existing collection'));
            else resolve(existing);
          }
        );
      });
  
      if (!existingCollection) {
        // Add to collection
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO collections (user_id, book_id, status) VALUES (?, ?, ?)',
            [req.user.id, bookId, 'want to read'],
            (err) => {
              if (err) reject(new Error('Failed to add book to collection'));
              else resolve();
            }
          );
        });
      }
  
      // Get the complete book data
      const book = await new Promise((resolve, reject) => {
        db.get(`
          SELECT b.*, c.status
          FROM books b
          JOIN collections c ON b.id = c.book_id
          WHERE b.id = ? AND c.user_id = ?
        `, [bookId, req.user.id], (err, book) => {
          if (err) reject(new Error('Failed to fetch updated book data'));
          else resolve(book);
        });
      });
  
      await db.run('COMMIT');
      transaction = false;
      res.status(201).json(book);
  
    } catch (error) {
      console.error('Detailed error:', error);
      if (transaction) {
        try {
          await db.run('ROLLBACK');
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
      }
      res.status(500).json({ 
        error: error.message || 'Failed to add book to library',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Remove from library
  router.delete('/:id', authenticateToken, (req, res) => {
    db.run(
      'DELETE FROM collections WHERE user_id = ? AND book_id = ?',
      [req.user.id, req.params.id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error removing book' });
        }
        res.status(204).send();
      }
    );
  });

  // Update book status
  router.patch('/:id/status', authenticateToken, (req, res) => {
    const { status } = req.body;
    const validStatuses = ['read', 'want to read', 'currently reading', 'did not finish'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.run(
      'UPDATE collections SET status = ? WHERE user_id = ? AND book_id = ?',
      [status, req.user.id, req.params.id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error updating status' });
        }
        res.status(200).json({ message: 'Status updated successfully' });
      }
    );
  });

  return router;
};