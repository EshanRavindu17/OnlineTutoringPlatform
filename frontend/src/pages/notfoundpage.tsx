// src/components/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-xl text-gray-600 mb-6">Oops! Page not found.</p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
