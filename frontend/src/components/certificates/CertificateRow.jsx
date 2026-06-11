import React from 'react';
import { format } from 'date-fns';

const FRONTEND_BASE = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';

export default function CertificateRow({ cert, onDownload, onDelete, index, downloading }) {
  const formatDate = (d) => {
    try { return d ? format(new Date(d), 'dd.MM.yyyy') : '—'; }
    catch { return d || '—'; }
  };

  const verifyUrl = cert.verification_code
    ? `${FRONTEND_BASE}/verify/${cert.verification_code}`
    : null;

  const copyVerifyLink = () => {
    if (!verifyUrl) return;
    navigator.clipboard.writeText(verifyUrl).then(() => alert('Havola nusxalandi!'));
  };

  return (
    <tr>
      <td style={{ color: 'var(--gray-400)', width: 40 }}>{index}</td>
      <td>
        <div style={{ fontWeight: 500 }}>{cert.series} {cert.certificate_number}</div>
        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{cert.template_name}</div>
      </td>
      <td>{cert.employee_name}</td>
      <td>{cert.specialization_name}</td>
      <td>
        <div style={{ fontSize: 13 }}>{formatDate(cert.start_date)}</div>
        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>→ {formatDate(cert.end_date)}</div>
      </td>
      <td>{cert.hours} soat</td>
      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>
        {formatDate(cert.created_at?.slice(0, 10))}
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {verifyUrl && (
            <a href={verifyUrl} target="_blank" rel="noopener noreferrer"
              className="btn btn-secondary btn-sm btn-icon"
              title="Sertifikatni tekshirish sahifasi">🔍</a>
          )}
          {verifyUrl && (
            <button className="btn btn-secondary btn-sm btn-icon"
              onClick={copyVerifyLink} title="Tekshiruv havolasini nusxalash">🔗</button>
          )}
          {/* PDF download */}
          {cert.generated_pdf && (
            <button
              className="btn btn-success btn-sm btn-icon"
              onClick={() => onDownload(cert.id)}
              disabled={downloading}
              title="PDF yuklab olish"
            >
              {downloading ? '⏳' : '⬇'}
            </button>
          )}
          <button className="btn btn-danger btn-sm btn-icon"
            onClick={() => onDelete(cert)} title="O'chirish">🗑</button>
        </div>
      </td>
    </tr>
  );
}
