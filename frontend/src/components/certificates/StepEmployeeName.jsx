import React from 'react';

export default function StepEmployeeName({ data, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">
        Xodim F.I.O. <span className="required">*</span>
      </label>
      <input
        type="text"
        className="form-input"
        placeholder="Masalan: Aliyev Bobur Karimovich"
        value={data.employee_name || ''}
        onChange={(e) => onChange('employee_name', e.target.value)}
        required
        style={{ fontSize: 15 }}
      />
      <span className="form-hint">To'liq familiya, ism va otasining ismi</span>
    </div>
  );
}