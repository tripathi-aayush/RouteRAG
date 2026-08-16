import React from 'react';
import Link from 'next/link';

export default function ErrorPage({ code, message }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            {code}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {message || 'Something went wrong'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}