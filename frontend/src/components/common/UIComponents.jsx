import React from 'react';

// Loading spinner
export function Spinner({ size = 'md', className = '' }) {
  return (
    <span className={`spinner ${size === 'sm' ? 'spinner-sm' : ''} ${className}`} />
  );
}

// Confirm delete modal
export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title || "O'chirishni tasdiqlash"}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--gray-600)' }}>{message || "Haqiqatan ham o'chirmoqchimisiz?"}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>Bekor qilish</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner size="sm" /> : null}
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
}

// Alert
export function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}>✕</button>
      )}
    </div>
  );
}

// Search input
export function SearchInput({ value, onChange, placeholder = 'Qidirish...' }) {
  return (
    <div style={{ position: 'relative', minWidth: 240 }}>
      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>
        🔍
      </span>
      <input
        type="text"
        className="form-input"
        style={{ paddingLeft: 32 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// Empty state
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p style={{ marginTop: 4, marginBottom: 16 }}>{description}</p>}
      {action}
    </div>
  );
}

// Status badge
export function StatusBadge({ active }) {
  return (
    <span className={`badge ${active ? 'badge-green' : 'badge-gray'}`}>
      {active ? '● Faol' : '● Faol emas'}
    </span>
  );
}

// Pagination
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 20 }}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >← Oldingi</button>
      <span style={{ color: 'var(--gray-600)', fontSize: 13 }}>
        {page} / {totalPages}
      </span>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >Keyingi →</button>
    </div>
  );
}