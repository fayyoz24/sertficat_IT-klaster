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

function formatDateShort(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('uz-UZ', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return d; }
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#0e9f6e" />
      <path d="M5.5 10.5l3 3 6-6" stroke="#fff" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoRow({ label, value }) {
  if (!value || value === '—') return null;
  return (
    <div className="vp-info-row">
      <span className="vp-info-label">{label}</span>
      <span className="vp-info-value">{value}</span>
    </div>
  );
}

export default function VerifyPage() {
  const { code } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

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
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `sertifikat_${cert.certificate_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Yuklab bo'lmadi"); }
    finally { setDownloading(false); }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="vp-root vp-center">
        <Spinner />
        <p style={{ marginTop: 14, color: '#6b7280', fontSize: 14 }}>
          Sertifikat tekshirilmoqda...
        </p>
      </div>
    );
  }

  /* ─── Not found ─── */
  if (notFound) {
    return (
      <div className="vp-root vp-center">
        <div className="vp-card vp-invalid">
          <div className="vp-invalid-icon">✕</div>
          <h2>Sertifikat topilmadi</h2>
          <p>
            Bu QR kod noto'g'ri yoki sertifikat o'chirilgan bo'lishi mumkin.
            Iltimos, sertifikatingizdagi QR kodni qayta tekshiring.
          </p>
        </div>
      </div>
    );
  }

  const certLabel = cert.template_type || 'Sertifikat';

  /* ─── Valid certificate ─── */
  return (
    <div className="vp-root">

      {/* ── Top bar ── */}
      <header className="vp-header">
        <div className="vp-header-inner">
          <div className="vp-logo-group">
            <span className="vp-logo-icon">🎓</span>
            <span className="vp-logo-text">IT Klaster</span>
          </div>
          <div className="vp-header-right">
            <span className="vp-header-label">Sertifikat tekshiruvi</span>
            <button className="vp-share-btn" onClick={handleCopyLink}>
              {copied ? '✓ Nusxalandi' : '🔗 Ulashish'}
            </button>
          </div>
        </div>
      </header>

      <main className="vp-main">

        {/* ── Hero ── */}
        <div className="vp-card vp-hero">
          {/* Accent bar */}
          <div className="vp-hero-accent" />

          <div className="vp-hero-top">
            <div className="vp-verified-badge">
              <CheckIcon />
              <span>Tasdiqlangan {certLabel}</span>
            </div>
            <span className="vp-cert-type-tag">{certLabel.toUpperCase()}</span>
          </div>

          {/* Issued to */}
          <div className="vp-issued-label">Berildi:</div>
          <h1 className="vp-name">{cert.employee_name}</h1>

          {/* Specialization */}
          <div className="vp-spec-row">
            <span className="vp-spec-badge">{cert.specialization_code}</span>
            <span className="vp-spec-name">{cert.specialization_name}</span>
          </div>

          <p className="vp-subtitle">
            mutaxassisligi bo'yicha o'quv kursini muvaffaqiyatli tamomladi
          </p>

          {/* Date chips */}
          <div className="vp-dates-row">
            <div className="vp-date-chip">
              <span className="vp-date-label">Boshlanish</span>
              <span className="vp-date-val">{formatDateShort(cert.start_date)}</span>
            </div>
            <div className="vp-date-arrow">→</div>
            <div className="vp-date-chip">
              <span className="vp-date-label">Tugash</span>
              <span className="vp-date-val">{formatDateShort(cert.end_date)}</span>
            </div>
            <div className="vp-date-chip vp-date-chip-accent">
              <span className="vp-date-label">Davomiyligi</span>
              <span className="vp-date-val">
                {cert.duration_days} kun · {cert.hours} soat
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="vp-actions">
            <button
              className="vp-download-btn"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? <Spinner size="sm" /> : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
              {certLabel}ni yuklab olish
            </button>

            <button className="vp-share-btn-lg" onClick={handleCopyLink}>
              {copied ? '✓ Nusxalandi!' : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Havolani nusxalash
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Details card ── */}
        <div className="vp-card vp-details">
          <h3 className="vp-details-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ marginRight: 8 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {certLabel} ma'lumotlari
          </h3>
          <div className="vp-info-grid">
            <InfoRow
              label="Sertifikat raqami"
              value={`${cert.series || ''} ${cert.certificate_number}`.trim()}
            />
            {/* <InfoRow label="Mutaxassislik kodi" value={cert.specialization_code} /> */}
            <InfoRow label="Mutaxassislik" value={cert.specialization_name} />
            <InfoRow label="Shablon" value={cert.template_name} />
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

        {/* ── Verification code block ── */}
        <div className="vp-verify-block">
          <div className="vp-verify-icon">
            <CheckIcon />
          </div>
          <div className="vp-verify-text">
            <div className="vp-verify-title">Haqiqiy sertifikat</div>
            <div className="vp-verify-code">{cert.verification_code}</div>
          </div>
        </div>

        <p className="vp-footer-note">
          Bu sahifa IT Klaster tomonidan avtomatik yaratilgan bo'lib,
          {certLabel.toLowerCase()}ning haqiqiyligini tasdiqlaydi.
          <br />
          Tekshiruv kodi: <code>{cert.verification_code}</code>
        </p>

      </main>
    </div>
  );
}