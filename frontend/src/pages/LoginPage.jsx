import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError("Login va parol kiritilmagan"); return; }
    setLoading(true);
    setError('');
    try {
      await authApi.login(username, password);
      navigate('/sertifikatlar', { replace: true });
    } catch {
      setError("Login yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--gray-50)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: 0 }}>
        <div className="card-header" style={{ justifyContent: 'center', flexDirection: 'column', gap: 4, padding: '28px 24px 20px' }}>
          <div style={{ fontSize: 32, textAlign: 'center' }}>🎓</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)', textAlign: 'center' }}>
            IT Klaster
          </h2>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', textAlign: 'center' }}>
            Sertifikat boshqaruv tizimi
          </p>
        </div>

        <form className="card-body" onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <div className="form-group">
            <label className="form-label">Login</label>
            <input
              className="form-input"
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parol</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
}