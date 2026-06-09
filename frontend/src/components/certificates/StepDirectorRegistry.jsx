import React from 'react';

export default function StepDirectorRegistry({ data, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="form-group">
        <label className="form-label">
          Direktor F.I.Sh. <span className="required">*</span>
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="Masalan: Rahimov Akbar Toshpulatovich"
          value={data.director_name || ''}
          onChange={(e) => onChange('director_name', e.target.value)}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Ro'yxatga olish raqami</label>
          <input
            type="text"
            className="form-input"
            placeholder="Masalan: RO-001"
            value={data.registration_number || ''}
            onChange={(e) => onChange('registration_number', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Ro'yxatga olish sanasi</label>
          <input
            type="date"
            className="form-input"
            value={data.registration_date || ''}
            onChange={(e) => onChange('registration_date', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}