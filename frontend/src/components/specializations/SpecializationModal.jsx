import React, { useState, useEffect } from 'react';
import { Spinner } from '../common/UIComponents';
import { specializationsApi } from '../../services/api';

const EMPTY = { code: '', name_latin: '', name_cyrillic: '', name_russian: '', name_english: '' };

export default function SpecializationModal({ isOpen, onClose, onSuccess, editItem }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) setForm(editItem);
    else setForm(EMPTY);
    setError('');
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.code) { setError('Kod kiritilmagan'); return; }
    if (!form.name_latin) { setError("Lotin nomi kiritilmagan"); return; }

    setSaving(true);
    setError('');
    try {
      if (editItem?.id) {
        await specializationsApi.update(editItem.id, form);
      } else {
        await specializationsApi.create(form);
      }
      onSuccess();
      onClose();
    } catch (e) {
      const d = e.response?.data;
      setError(d ? Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ') : 'Xato yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{editItem ? 'Kursni tahrirlash' : 'Yangi kurs'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Kod <span className="required">*</span></label>
              <input className="form-input" placeholder="P-001" value={form.code}
                onChange={(e) => handleChange('code', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Lotin (UZ) <span className="required">*</span></label>
              <input className="form-input" placeholder="Armaturachi" value={form.name_latin}
                onChange={(e) => handleChange('name_latin', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kirill (UZ)</label>
            <input className="form-input" placeholder="Арматурачи" value={form.name_cyrillic}
              onChange={(e) => handleChange('name_cyrillic', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Русский</label>
              <input className="form-input" placeholder="Арматурщик" value={form.name_russian}
                onChange={(e) => handleChange('name_russian', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">English</label>
              <input className="form-input" placeholder="Reinforcement worker" value={form.name_english}
                onChange={(e) => handleChange('name_english', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Bekor qilish</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner size="sm" /> : '💾'}
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}