import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentStore } from '../store/documentStore';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import './Dashboard.css';

const QUICK_ACTIONS = [
  { type: 'MAWB', label: 'Air Waybill', icon: '✈️', color: '#6366f1' },
  { type: 'HAWB', label: 'House AWB', icon: '📋', color: '#8b5cf6' },
  { type: 'BILL_OF_LADING', label: 'Bill of Lading', icon: '🚢', color: '#06b6d4' },
  { type: 'FWB', label: 'FWB (eAWB)', icon: '⚡', color: '#f59e0b' },
  { type: 'PROFORMA_INVOICE', label: 'Invoice', icon: '📄', color: '#10b981' },
  { type: 'BOOKING', label: 'Booking', icon: '📅', color: '#f97316' },
];

export default function Dashboard() {
  const { documents, pagination, fetchDocuments, isLoading } = useDocumentStore();
  const [stats, setStats] = useState({ total: 0, draft: 0, inTransit: 0, delivered: 0 });

  useEffect(() => {
    fetchDocuments({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  }, []);

  useEffect(() => {
    // Calculate stats from loaded documents
    setStats({
      total: pagination.total,
      draft: documents.filter((d) => d.status === 'DRAFT').length,
      inTransit: documents.filter((d) => ['DEPARTED', 'IN_TRANSIT', 'BOOKED'].includes(d.status)).length,
      delivered: documents.filter((d) => ['DELIVERED', 'COMPLETED'].includes(d.status)).length,
    });
  }, [documents, pagination]);

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Welcome back! Here's your freight overview.</p>
        </div>
        <Link to="/new">
          <Button variant="primary" icon="➕">New Document</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="dashboard__stats">
        <div className="stat-card stat-card--total">
          <div className="stat-card__icon">📊</div>
          <div className="stat-card__content">
            <p className="stat-card__value">{stats.total}</p>
            <p className="stat-card__label">Total Documents</p>
          </div>
        </div>
        <div className="stat-card stat-card--draft">
          <div className="stat-card__icon">📝</div>
          <div className="stat-card__content">
            <p className="stat-card__value">{stats.draft}</p>
            <p className="stat-card__label">Drafts</p>
          </div>
        </div>
        <div className="stat-card stat-card--transit">
          <div className="stat-card__icon">🚀</div>
          <div className="stat-card__content">
            <p className="stat-card__value">{stats.inTransit}</p>
            <p className="stat-card__label">In Transit</p>
          </div>
        </div>
        <div className="stat-card stat-card--delivered">
          <div className="stat-card__icon">✅</div>
          <div className="stat-card__content">
            <p className="stat-card__value">{stats.delivered}</p>
            <p className="stat-card__label">Delivered</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard__section">
        <h2 className="dashboard__section-title">Quick Actions</h2>
        <div className="quick-actions">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.type}
              to={`/documents/new/${action.type}`}
              className="quick-action"
              style={{ '--action-color': action.color }}
            >
              <span className="quick-action__icon">{action.icon}</span>
              <span className="quick-action__label">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      <div className="dashboard__section">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">Recent Documents</h2>
          <Link to="/documents" className="dashboard__view-all">View all →</Link>
        </div>

        {isLoading ? (
          <div className="dashboard__loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-row" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="dashboard__empty">
            <p>No documents yet. Create your first one!</p>
            <Link to="/new">
              <Button variant="primary">Create Document</Button>
            </Link>
          </div>
        ) : (
          <div className="recent-table">
            <table>
              <thead>
                <tr>
                  <th>Document #</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="recent-table__row">
                    <td>
                      <Link to={`/documents/${doc.id}`} className="recent-table__link">
                        {doc.documentNumber || '—'}
                      </Link>
                    </td>
                    <td className="recent-table__type">{doc.documentType}</td>
                    <td className="truncate" style={{ maxWidth: '250px' }}>{doc.title || '—'}</td>
                    <td><Badge status={doc.status} size="sm" /></td>
                    <td className="recent-table__date">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
