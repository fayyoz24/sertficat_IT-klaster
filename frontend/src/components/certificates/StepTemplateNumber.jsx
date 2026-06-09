import React from 'react';

export default function StepTemplateNumber({ data, onChange, templates }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="form-group">
        <label className="form-label">
          Shablon <span className="required">*</span>
        </label>
        <select
          className="form-select"
          value={data.template || ''}
          onChange={(e) => onChange('template', e.target.value)}
          required
        >
          <option value="">— Shablon tanlang —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.template_type_display})
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Seriya</label>
          <input
            type="text"
            className="form-input"
            placeholder="Masalan: NS"
            value={data.series || ''}
            onChange={(e) => onChange('series', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Sertifikat raqami <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Masalan: 001"
            value={data.certificate_number || ''}
            onChange={(e) => onChange('certificate_number', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}