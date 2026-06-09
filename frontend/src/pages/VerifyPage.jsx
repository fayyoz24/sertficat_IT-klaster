import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyApi, certificatesApi } from '../services/api';
import { Spinner } from '../components/common/UIComponents';
import './VerifyPage.css';

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('uz-UZ', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return d; }
}

function VerifiedBadge() {
  return (
    <div className="vp-badge">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="14" fill="#0e9f6e" />
        <path d="M8 14.5l4 4 8-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>Tasdiqlangan sertifikat</span>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="vp-info-row">
      <span className="vp-info-label">{label}</span>
      <span className="vp-info-value">{value || '—'}</span>
    </div>
  );
}

export default function VerifyPage() {
  const { code } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    verifyApi.verify(code)
      .then((r) => setCert(r.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  const handleDownload = async () => {
    if (!cert?.id) return;
    setDownloading(true);
    try {
      const res = await certificatesApi.download(cert.id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `sertifikat_${cert.certificate_number}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Yuklab bo'lmadi"); }
    finally { setDownloading(false); }
  };

  if (loading) {
    return (
      <div className="vp-root">
        <div className="vp-center">
          <Spinner />
          <p style={{ marginTop: 12, color: '#6b7280' }}>Tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="vp-root">
        <div className="vp-card vp-invalid">
          <div className="vp-invalid-icon">✕</div>
          <h2>Sertifikat topilmadi</h2>
          <p>Bu QR kod noto'g'ri yoki sertifikat o'chirilgan bo'lishi mumkin.</p>
          <Link to="/" className="vp-home-link">← Bosh sahifaga qaytish</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="vp-root">
      {/* Header stripe */}
      <header className="vp-header">
        <div className="vp-header-inner">
          <span className="vp-logo">🎓 O'quv Markazi</span>
          <span className="vp-header-label">Sertifikat tekshiruvi</span>
        </div>
      </header>

      <main className="vp-main">
        {/* Hero card */}
        <div className="vp-card vp-hero">
          <div className="vp-hero-top">
            <VerifiedBadge />
            <div className="vp-cert-type">{cert.template_type || 'Sertifikat'}</div>
          </div>

          <h1 className="vp-name">{cert.employee_name}</h1>
          <p className="vp-subtitle">
            <strong>{cert.specialization_name}</strong> mutaxassisligi bo'yicha
            o'quv kursini muvaffaqiyatli tamomladi
          </p>

          <div className="vp-dates-row">
            <div className="vp-date-chip">
              <span className="vp-date-label">Boshlanish</span>
              <span className="vp-date-val">{formatDate(cert.start_date)}</span>
            </div>
            <div className="vp-date-arrow">→</div>
            <div className="vp-date-chip">
              <span className="vp-date-label">Tugash</span>
              <span className="vp-date-val">{formatDate(cert.end_date)}</span>
            </div>
            <div className="vp-date-chip vp-date-chip-accent">
              <span className="vp-date-label">Davomiyligi</span>
              <span className="vp-date-val">{cert.duration_days} kun · {cert.hours} soat</span>
            </div>
          </div>

          <button
            className="vp-download-btn"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? <Spinner size="sm" /> : '⬇'}
            Sertifikatni yuklab olish
          </button>
        </div>

        {/* Details card */}
        <div className="vp-card vp-details">
          <h3 className="vp-details-title">Sertifikat ma'lumotlari</h3>
          <div className="vp-info-grid">
            <InfoRow label="Sertifikat raqami" value={`${cert.series || ''} ${cert.certificate_number}`.trim()} />
            <InfoRow label="Mutaxassislik kodi" value={cert.specialization_code} />
            <InfoRow label="Shablon nomi" value={cert.template_name} />
            <InfoRow label="Direktor" value={cert.director_name} />
            {cert.registration_number && (
              <InfoRow label="Ro'yxat raqami" value={cert.registration_number} />
            )}
            {cert.registration_date && (
              <InfoRow label="Ro'yxat sanasi" value={formatDate(cert.registration_date)} />
            )}
            <InfoRow label="Berilgan sana" value={formatDate(cert.created_at?.slice(0, 10))} />
          </div>
        </div>

        {/* Verification code */}
        <div className="vp-code-block">
          <span className="vp-code-label">Tekshiruv kodi:</span>
          <code className="vp-code">{cert.verification_code}</code>
        </div>

        <p className="vp-footer-note">
          Bu sahifa O'quv Markazi tomonidan sertifikatning haqiqiyligini tasdiqlash uchun yaratilgan.
        </p>
      </main>
    </div>
  );
}
