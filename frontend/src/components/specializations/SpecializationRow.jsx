import React from 'react';

export default function SpecializationRow({ item, onEdit, onDelete, index }) {
  return (
    <tr>
      <td style={{ color: 'var(--gray-400)', width: 40 }}>{index}</td>
      <td><span className="badge badge-blue">{item.code}</span></td>
      <td style={{ fontWeight: 500 }}>{item.name_latin}</td>
      <td>{item.name_cyrillic}</td>
      <td>{item.name_russian}</td>
      <td>{item.name_english}</td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={() => onEdit(item)} title="Tahrirlash">✏️</button>
          <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(item)} title="O'chirish">🗑</button>
        </div>
      </td>
    </tr>
  );
}