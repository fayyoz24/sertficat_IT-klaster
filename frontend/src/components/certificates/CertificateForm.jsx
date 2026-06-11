import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepIndicator from './StepIndicator';
import StepTemplateNumber from './StepTemplateNumber';
import StepEmployeeName from './StepEmployeeName';
import StepProfessionDuration from './StepProfessionDuration';
import StepDirectorRegistry from './StepDirectorRegistry';
import { Alert, Spinner } from '../common/UIComponents';
import { certificatesApi, templatesApi, specializationsApi } from '../../services/api';

const EMPTY = {
  template: '', series: '', certificate_number: '',
  employee_name: '',
  specialization: '', start_date: '', duration_days: '', end_date: '', hours: '',
  director_name: '', registration_number: '', registration_date: '',
};

const STEPS = ['Shablon & raqam', 'Student F.I.O.', 'Kasb va davomiyligi', "Direktor & ro'yxat"];

function validate(step, data) {
  if (step === 1) {
    if (!data.template) return 'Shablon tanlanmagan';
    if (!data.certificate_number) return 'Sertifikat raqami kiritilmagan';
  }
  if (step === 2) {
    if (!data.employee_name) return "Student F.I.O. kiritilmagan";
  }
  if (step === 3) {
    if (!data.specialization) return 'Kasb tanlanmagan';
    if (!data.start_date) return 'Boshlanish sanasi kiritilmagan';
    if (!data.duration_days) return 'Davomiylik kiritilmagan';
    if (!data.end_date) return 'Tugash sanasi kiritilmagan';
    if (!data.hours) return 'Soat kiritilmagan';
  }
  if (step === 4) {
    if (!data.director_name) return "Direktor F.I.Sh. kiritilmagan";
  }
  return null;
}

export default function CertificateForm({ initialData, certificateId }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData || EMPTY);
  const [templates, setTemplates] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    templatesApi.getAll({ is_active: true }).then((r) => setTemplates(r.data.results || r.data));
    specializationsApi.getAll({ page_size: 100 }).then((r) => setSpecializations(r.data.results || r.data));
  }, []);

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleNext = () => {
    const err = validate(step, data);
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const err = validate(4, data);
    if (err) { setError(err); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...data,
        template: parseInt(data.template),
        specialization: parseInt(data.specialization),
        duration_days: parseInt(data.duration_days),
        hours: parseInt(data.hours),
        registration_date: data.registration_date || null,
        registration_number: data.registration_number || '',
        series: data.series || '',
      };

      if (certificateId) {
        await certificatesApi.update(certificateId, payload);
      } else {
        await certificatesApi.create(payload);
      }
      navigate('/sertifikatlar');
    } catch (e) {
      const msg = e.response?.data
        ? Object.values(e.response.data).flat().join(', ')
        : 'Xato yuz berdi';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const stepComponents = [
    <StepTemplateNumber data={data} onChange={handleChange} templates={templates} />,
    <StepEmployeeName data={data} onChange={handleChange} />,
    <StepProfessionDuration data={data} onChange={handleChange} specializations={specializations} />,
    <StepDirectorRegistry data={data} onChange={handleChange} />,
  ];

  return (
    <div>
      <StepIndicator currentStep={step} />

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            {step}-bo'lim: {STEPS[step - 1]}
          </h3>
        </div>
        <div className="card-body">
          {error && <Alert message={error} onClose={() => setError('')} style={{ marginBottom: 16 }} />}
          <div style={{ marginBottom: error ? 0 : 0 }}>
            {error && <div style={{ marginBottom: 16 }}></div>}
            {stepComponents[step - 1]}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button
          className="btn btn-secondary"
          onClick={step === 1 ? () => navigate('/sertifikatlar') : handleBack}
        >
          {step === 1 ? '← Bekor qilish' : '← Orqaga'}
        </button>

        {step < 4 ? (
          <button className="btn btn-primary" onClick={handleNext}>
            Keyingi →
          </button>
        ) : (
          <button className="btn btn-success" onClick={handleSubmit} disabled={saving}>
            {saving ? <Spinner size="sm" /> : '💾'}
            Saqlash va docx yaratish
          </button>
        )}
      </div>
    </div>
  );
}