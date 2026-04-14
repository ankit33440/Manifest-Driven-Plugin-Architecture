import React, { useCallback, useEffect, useState } from 'react';
import api from '../../../core/api/axios';
import PageHeader from '../../../components/PageHeader';
import PageLoader from '../../../components/PageLoader';

interface AuditLog {
  id: string;
  entity: string;
  entityId: string | null;
  action: string;
  performedBy: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface PagedResult {
  data: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

const ENTITY_TYPES = ['PROJECT', 'PROJECT_DOCUMENT', 'USER'];

export default function AdminAuditPage() {
  const [result, setResult] = useState<PagedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (entity) params.append('entity', entity);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    api
      .get(`/admin/audit-logs?${params.toString()}`)
      .then((r) => setResult(r.data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [entity, from, to, page]);

  useEffect(() => {
    load();
  }, [load]);

  function handleFilter() {
    setPage(1);
    load();
  }

  if (loading && !result) return <PageLoader />;

  const logs = result?.data ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Audit Log"
        subtitle={result ? `${result.total} total entries` : ''}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="field text-sm max-w-[160px]"
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
        >
          <option value="">All Entities</option>
          {ENTITY_TYPES.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <input
          type="date"
          className="field text-sm"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From"
        />
        <input
          type="date"
          className="field text-sm"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
        />
        <button onClick={handleFilter} className="btn-primary text-sm px-4 py-2">
          Filter
        </button>
        {(entity || from || to) && (
          <button
            onClick={() => { setEntity(''); setFrom(''); setTo(''); setPage(1); }}
            className="text-xs text-stone-400 hover:text-slate-700"
          >
            Clear
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 text-stone-400">No audit entries found.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100">
              <thead className="bg-stone-50">
                <tr>
                  {['Timestamp', 'Entity', 'ID', 'Action', 'Performed By', 'Metadata'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-stone-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-stone-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold bg-stone-100 text-stone-600 rounded px-1.5 py-0.5">
                        {log.entity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400 font-mono">
                      {log.entityId ? log.entityId.slice(0, 8) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400 font-mono">
                      {log.performedBy ? log.performedBy.slice(0, 8) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <button
                          onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {expandedId === log.id ? 'Hide' : 'Show'}
                        </button>
                      ) : (
                        <span className="text-xs text-stone-300">—</span>
                      )}
                      {expandedId === log.id && log.metadata && (
                        <pre className="mt-1 text-[10px] text-stone-500 bg-stone-50 rounded p-2 max-w-xs overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {result && result.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
              <p className="text-xs text-stone-400">
                Page {result.page} of {result.totalPages} · {result.total} entries
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-xs font-medium text-slate-700 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 disabled:opacity-40"
                >
                  ← Prev
                </button>
                <button
                  disabled={page >= result.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-xs font-medium text-slate-700 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
