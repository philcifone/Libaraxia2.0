import React from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Library Catalog</h1>
        {user ? (
          <p>Welcome back, {user.username}!</p>
        ) : (
          <p>Please login to manage your library.</p>
        )}
      </div>
    </Layout>
  );
}