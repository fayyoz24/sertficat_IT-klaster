import React, { useEffect } from 'react';
import { certificatesApi } from '../../services/api';

export default function StepProfessionDuration({ data, onChange, specializations }) {
  // Auto-calculate end date when start_date or duration_days changes
  useEffect(() => {
    const { start_date, duration_days } = data;
    if (start_date && duration_days && parseInt(duration_days) > 0) {
      certificatesApi
        .calculateEndDate(start_date, duration_days)
        .then((res) => onChange('end_date', res.data.end_date))
        .catch(() => {});
    }
  }, [data.start_date, data.duration_days]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="form-group">
        <label className="form-label">
          Kasb <span className="required">*</span>
        </label>
        <select
          className="form-select"
          value={data.specialization || ''}
          onChange={(e) => onChange('specialization', e.target.value)}
          required
        >
          <option value="">— Kasb tanlang —</option>
          {specializations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name_latin}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">
            Boshlanish sanasi <span className="required">*</span>
          </label>
          <input
            type="date"
            className="form-input"
            value={data.start_date || ''}
            onChange={(e) => onChange('start_date', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Davomiylik (kun) <span className="required">*</span>
          </label>
          <input
            type="number"
            className="form-input"
            placeholder="Masalan: 30"
            min="1"
            value={data.duration_days || ''}
            onChange={(e) => onChange('duration_days', e.target.value)}
            required
          />
          <span className="form-hint">Kiritilsa, tugash sanasi avtomatik to'ldiriladi</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">
            Tugash sanasi <span className="required">*</span>
          </label>
          <input
            type="date"
            className="form-input"
            value={data.end_date || ''}
            onChange={(e) => onChange('end_date', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Soat <span className="required">*</span>
          </label>
          <input
            type="number"
            className="form-input"
            placeholder="Masalan: 72"
            min="1"
            value={data.hours || ''}
            onChange={(e) => onChange('hours', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}