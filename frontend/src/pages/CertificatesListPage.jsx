import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CertificateRow from '../components/certificates/CertificateRow';
import { Spinner, ConfirmModal, SearchInput, EmptyState, Pagination } from '../components/common/UIComponents';
import { certificatesApi } from '../services/api';

export default function CertificatesListPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await certificatesApi.getAll({ search, page });
      const data = res.data;
      if (data.results) {
        setCerts(data.results);
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setCerts(data);
        setTotalPages(1);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (id) => {
    setDownloading(id);
    try {
      const res = await certificatesApi.download(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `sertifikat_${id}.pdf`;   // ← .pdf
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Yuklab bo\'lmadi'); }
    finally { setDownloading(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await certificatesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch { alert("O'chirib bo'lmadi"); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sertifikatlar</h1>
          <p className="page-subtitle">Barcha yaratilgan sertifikatlar ro'yxati</p>
        </div>
        <Link to="/sertifikatlar/yangi" className="btn btn-primary">＋ Yangi sertifikat</Link>
      </div>

      <div className="card">
        <div className="card-header">
          <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>Jami: {certs.length} ta</span>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        </div>

        {loading ? (
          <div className="loading-center"><Spinner /> <span>Yuklanmoqda...</span></div>
        ) : certs.length === 0 ? (
          <EmptyState icon="📄" title="Sertifikatlar yo'q"
            description="Hali hech qanday sertifikat yaratilmagan"
            action={<Link to="/sertifikatlar/yangi" className="btn btn-primary">＋ Yaratish</Link>}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Raqam / Shablon</th>
                  <th>Xodim F.I.O.</th>
                  <th>Kasb</th>
                  <th>Davomiyligi</th>
                  <th>Soat</th>
                  <th>Yaratilgan</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c, i) => (
                  <CertificateRow
                    key={c.id}
                    cert={c}
                    index={(page - 1) * 20 + i + 1}
                    onDownload={handleDownload}
                    onDelete={setDeleteTarget}
                    downloading={downloading === c.id}
                  />
                ))}
              </tbody>
            </table>
            <div style={{ padding: '12px 0' }}>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Sertifikatni o'chirish"
        message={`"${deleteTarget?.employee_name}" sertifikatini o'chirishni tasdiqlaysizmi?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
