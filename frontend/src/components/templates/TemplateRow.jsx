import React from 'react';
import { format } from 'date-fns';
import { StatusBadge } from '../common/UIComponents';

export default function TemplateRow({ template, onToggle, onDelete, index }) {
  const formatDate = (d) => {
    try { return d ? format(new Date(d), 'dd.MM.yyyy HH:mm') : '—'; } catch { return '—'; }
  };

  return (
    <tr>
      <td style={{ color: 'var(--gray-400)', width: 40 }}>{index}</td>
      <td style={{ fontWeight: 500 }}>{template.name}</td>
      <td>
        <span className="badge badge-blue">{template.template_type_display}</span>
      </td>
      <td style={{ fontSize: 13 }}>{template.file_name}</td>
      <td><StatusBadge active={template.is_active} /></td>
      <td>
        <div style={{ fontSize: 13 }}>
          {template.created_by_info?.username || 'Super Admin'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
          {formatDate(template.created_at)}
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={`btn btn-sm ${template.is_active ? 'btn-secondary' : 'btn-success'}`}
            onClick={() => onToggle(template)}
            title={template.is_active ? 'Faolsizlashtirish' : 'Faollashtirish'}
          >
            {template.is_active ? '⏸' : '▶'}
          </button>
          <button
            className="btn btn-danger btn-sm btn-icon"
            onClick={() => onDelete(template)}
            title="O'chirish"
          >🗑</button>
        </div>
      </td>
    </tr>
  );
}