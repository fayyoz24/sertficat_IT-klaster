import React, { useState, useEffect, useCallback } from 'react';
import TemplateRow from '../components/templates/TemplateRow';
import TemplateUploadModal from '../components/templates/TemplateUploadModal';
import { Spinner, ConfirmModal, SearchInput, EmptyState } from '../components/common/UIComponents';
import { templatesApi } from '../services/api';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await templatesApi.getAll({ search });
      setTemplates(res.data.results || res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (template) => {
    try {
      const fd = new FormData();
      fd.append('is_active', !template.is_active);
      await templatesApi.update(template.id, fd);
      load();
    } catch { alert('Xato yuz berdi'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await templatesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch { alert("O'chirib bo'lmadi"); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hujjat shablonlari</h1>
          <p className="page-subtitle">Barcha shablonlar</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
          ⬆ Yangi shablon yuklash
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>
            Jami: {templates.length} ta
          </span>
          <SearchInput value={search} onChange={setSearch} placeholder="Shablon qidirish..." />
        </div>

        {loading ? (
          <div className="loading-center"><Spinner /><span>Yuklanmoqda...</span></div>
        ) : templates.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Shablonlar yo'q"
            description="Hali hech qanday shablon yuklanmagan"
            action={<button className="btn btn-primary" onClick={() => setShowUpload(true)}>⬆ Yuklash</button>}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nomi</th>
                  <th>Turi</th>
                  <th>Fayl</th>
                  <th>Holat</th>
                  <th>Yaratdi</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t, i) => (
                  <TemplateRow
                    key={t.id}
                    template={t}
                    index={i + 1}
                    onToggle={handleToggle}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TemplateUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={load}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Shablonni o'chirish"
        message={`"${deleteTarget?.name}" shablonini o'chirishni tasdiqlaysizmi?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}