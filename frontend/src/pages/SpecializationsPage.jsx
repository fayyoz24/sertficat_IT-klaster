import React, { useState, useEffect, useCallback } from 'react';
import SpecializationRow from '../components/specializations/SpecializationRow';
import SpecializationModal from '../components/specializations/SpecializationModal';
import { Spinner, ConfirmModal, SearchInput, EmptyState } from '../components/common/UIComponents';
import { specializationsApi } from '../services/api';

export default function SpecializationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await specializationsApi.getAll({ search, page_size: 100 });
      setItems(res.data.results || res.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setShowModal(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await specializationsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch { alert("O'chirib bo'lmadi"); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mutaxassisliklar (Kasblar)</h1>
          <p className="page-subtitle">Barcha mutaxassisliklar ({items.length})</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>＋ Yangi</button>
      </div>

      <div className="card">
        <div className="card-header">
          <span style={{ fontSize: 14, color: 'var(--gray-600)' }}>
            {items.length} ta mutaxassislik
          </span>
          <SearchInput value={search} onChange={setSearch} placeholder="Qidirish..." />
        </div>

        {loading ? (
          <div className="loading-center"><Spinner /><span>Yuklanmoqda...</span></div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="🏷️"
            title="Mutaxassisliklar yo'q"
            description="Hali hech qanday mutaxassislik qo'shilmagan"
            action={<button className="btn btn-primary" onClick={openCreate}>＋ Qo'shish</button>}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Kod</th>
                  <th>Lotin (UZ)</th>
                  <th>Kirill (UZ)</th>
                  <th>Русский</th>
                  <th>English</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <SpecializationRow
                    key={item.id}
                    item={item}
                    index={i + 1}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SpecializationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={load}
        editItem={editItem}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Mutaxassislikni o'chirish"
        message={`"${deleteTarget?.name_latin}" mutaxassisligini o'chirishni tasdiqlaysizmi?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}