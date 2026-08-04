import React from 'react';
import './Badge.css';

const STATUS_MAP = {
  DRAFT: 'draft',
  VALIDATED: 'validated',
  ISSUED: 'issued',
  BOOKED: 'booked',
  DEPARTED: 'departed',
  IN_TRANSIT: 'in-transit',
  ARRIVED: 'arrived',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/**
 * Badge component for displaying status and labels.
 */
export default function Badge({ status, variant, children, size = 'md', className = '' }) {
  const badgeClass = status ? `badge--${STATUS_MAP[status] || 'draft'}` : `badge--${variant || 'default'}`;

  return (
    <span className={`badge badge--${size} ${badgeClass} ${className}`}>
      <span className="badge__dot" />
      {children || status?.replace(/_/g, ' ')}
    </span>
  );
}
