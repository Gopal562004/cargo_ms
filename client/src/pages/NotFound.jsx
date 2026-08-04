import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-4 animate-scale-in">
        <div className="text-6xl font-black text-indigo-500">404</div>
        <h1 className="text-2xl font-bold text-slate-100">Page Not Found</h1>
        <p className="text-xs text-slate-400">The page you're looking for doesn't exist or has been moved.</p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="lg">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
