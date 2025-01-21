// src/pages/Search.jsx
import React from 'react';
import Layout from '../components/layout/Layout';
import BookSearch from '../components/books/BookSearch';

export default function Search() {
  return (
    <Layout>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Search Books</h1>
        <BookSearch />
      </div>
    </Layout>
  );
}