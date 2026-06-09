import React, { useState } from 'react';
import { Spinner } from '../common/UIComponents';
import { templatesApi } from '../../services/api';

export default function TemplateUploadModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', template_type: 'sertifikat' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.name) { setError("Nom kiritilmagan"); return; }
    if (!file) { setError("Fayl tanlanmagan"); return; }

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('template_type', form.template_type);
    fd.append('file', file);

    setSaving(true);
    setError('');
    try {
      await templatesApi.create(fd);
      onSuccess();
      onClose();
      setForm({ name: '', template_type: 'sertifikat' });
      setFile(null);
    } catch (e) {
      setError(e.response?.data ? JSON.stringify(e.response.data) : 'Xato yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Yangi shablon yuklash</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Nomi <span className="required">*</span></label>
            <input
              className="form-input"
              placeholder="Masalan: Sertifikat1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Turi <span className="required">*</span></label>
            <select
              className="form-select"
              value={form.template_type}
              onChange={(e) => setForm({ ...form, template_type: e.target.value })}
            >
              <option value="sertifikat">Sertifikat</option>
              <option value="guvohnoma">Guvohnoma</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Word fayl (.docx) <span className="required">*</span></label>
            <input
              type="file"
              className="form-input"
              accept=".docx"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <span className="form-hint">
              Faylda {'{{'}certificate_number{'}}'}, {'{{'}employee_name{'}}'} kabi o'zgaruvchilar bo'lishi kerak
            </span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Bekor qilish</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner size="sm" /> : '⬆'}
            Yuklash
          </button>
        </div>
      </div>
    </div>
  );
}