import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CertificateForm from '../components/certificates/CertificateForm';
import { Spinner } from '../components/common/UIComponents';
import { certificatesApi } from '../services/api';

export default function CertificateCreatePage() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    certificatesApi.getOne(id).then((r) => {
      const d = r.data;
      setInitialData({
        ...d,
        template: String(d.template),
        specialization: String(d.specialization),
      });
    }).finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {id ? "Sertifikatni tahrirlash" : "Yangi sertifikat yaratish"}
          </h1>
          <p className="page-subtitle">
            {id ? `ID: ${id}` : "4 bosqichda to'ldiring"}
          </p>
        </div>
        <Link to="/sertifikatlar" className="btn btn-secondary">← Orqaga</Link>
      </div>

      {loading ? (
        <div className="loading-center"><Spinner /> <span>Yuklanmoqda...</span></div>
      ) : (
        <CertificateForm initialData={initialData} certificateId={id} />
      )}
    </div>
  );
}