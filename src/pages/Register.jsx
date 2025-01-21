// src/pages/Register.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

export default function Register() {
  return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Create an Account</h1>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500">
            Login here
          </Link>
        </p>
      </div>
  );
}