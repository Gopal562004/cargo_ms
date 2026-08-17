import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  BarChart3,
  FileText,
  Truck,
  CheckCircle2,
  Plane,
  ClipboardList,
  Ship,
  Zap,
  Receipt,
  Calendar,
  Eye,
  Download,
  Pencil,
  ArrowRight,
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { downloadDocumentPDF, previewDocumentPDF } from '../services/documentService';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const QUICK_ACTIONS = [
  { type: 'MAWB', label: 'Air Waybill', icon: Plane, color: 'border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60' },
  { type: 'HAWB', label: 'House AWB', icon: ClipboardList, color: 'border-purple-500/30 text-purple-400 hover:border-purple-500/60' },
  { type: 'BILL_OF_LADING', label: 'Bill of Lading', icon: Ship, color: 'border-cyan-500/30 text-cyan-400 hover:border-cyan-500/60' },
  { type: 'FWB', label: 'FWB (eAWB)', icon: Zap, color: 'border-amber-500/30 text-amber-400 hover:border-amber-500/60' },
  { type: 'TAX_INVOICE', label: 'Tax Invoice', icon: Receipt, color: 'border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60' },
  { type: 'PROFORMA_INVOICE', label: 'Proforma', icon: FileText, color: 'border-teal-500/30 text-teal-400 hover:border-teal-500/60' },
  { type: 'BOOKING', label: 'Booking', icon: Calendar, color: 'border-orange-500/30 text-orange-400 hover:border-orange-500/60' },
];

export default function Dashboard() {
  const { documents, pagination, fetchDocuments, isLoading } = useDocumentStore();
  const [stats, setStats] = useState({ total: 0, draft: 0, inTransit: 0, delivered: 0 });

  useEffect(() => {
    fetchDocuments({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  }, []);

  useEffect(() => {
    setStats({
      total: pagination.total,
      draft: documents.filter((d) => d.status === 'DRAFT').length,
      inTransit: documents.filter((d) => ['DEPARTED', 'IN_TRANSIT', 'BOOKED'].includes(d.status)).length,
      delivered: documents.filter((d) => ['DELIVERED', 'COMPLETED'].includes(d.status)).length,
    });
  }, [documents, pagination]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Welcome back! Here's your freight overview.</p>
        </div>
        <Link to="/new">
          <Button variant="primary" className="rounded text-xs">
            <Plus size={14} className="mr-1.5 inline" /> New Document
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100 font-mono">{stats.total}</p>
            <p className="text-xs text-slate-400 font-medium">Total Documents</p>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-slate-500/10 text-slate-400 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100 font-mono">{stats.draft}</p>
            <p className="text-xs text-slate-400 font-medium">Drafts</p>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100 font-mono">{stats.inTransit}</p>
            <p className="text-xs text-slate-400 font-medium">In Transit</p>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100 font-mono">{stats.delivered}</p>
            <p className="text-xs text-slate-400 font-medium">Delivered</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-200">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.type}
                to={`/documents/new/${action.type}`}
                className={`flex flex-col items-center justify-center p-3.5 bg-slate-900/40 border ${action.color} rounded hover:bg-slate-800/50 transition-all text-center gap-2 group`}
              >
                <Icon size={22} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate w-full">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Documents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <FileText size={16} className="text-indigo-400" />
            Recent Documents
          </h2>
          <Link to="/documents" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-900/60 rounded animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded p-12 text-center space-y-4">
            <p className="text-sm text-slate-400">No documents yet. Create your first one!</p>
            <Link to="/new">
              <Button variant="primary" className="rounded text-xs">
                <Plus size={14} className="mr-1 inline" /> Create Document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-medium">
                  <th className="py-3.5 px-4">Document #</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium">
                      <Link to={`/documents/${doc.id}`} className="text-indigo-400 hover:text-indigo-300">
                        {doc.documentNumber || '—'}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{doc.documentType}</td>
                    <td className="py-3 px-4 text-slate-200 max-w-xs truncate">{doc.title || '—'}</td>
                    <td className="py-3 px-4"><Badge status={doc.status} size="sm" /></td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition-colors"
                          title="Preview PDF"
                          onClick={() => previewDocumentPDF(doc.id)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="Download PDF"
                          onClick={() => downloadDocumentPDF(doc.id, `${doc.documentNumber || 'document'}.pdf`)}
                        >
                          <Download size={15} />
                        </button>
                        <Link
                          to={`/documents/${doc.id}`}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="Edit Document"
                        >
                          <Pencil size={15} />
                        </Link>
                      </div>
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
