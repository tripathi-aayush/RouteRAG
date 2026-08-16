import React from 'react';
import Link from 'next/link';

export default function Custom500() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">500 - Server Error</h1>
        <p className="text-gray-600 mb-8">Something went wrong on our end. Please try again later.</p>
        <Link href="/" className="text-blue-500 hover:text-blue-700">
          Return to Home
        </Link>
      </div>
    </div>
  );
}