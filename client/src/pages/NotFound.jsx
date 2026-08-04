import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__content animate-scale-in">
        <div className="not-found__code">404</div>
        <h1 className="not-found__title">Page Not Found</h1>
        <p className="not-found__text">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button variant="primary" size="lg">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
