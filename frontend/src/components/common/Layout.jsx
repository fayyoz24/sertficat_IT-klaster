import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { authApi } from '../../services/api';
import './Layout.css';

const NAV_ITEMS = [
  { path: '/sertifikatlar', label: 'Sertifikatlar', icon: '📄' },
  { path: '/shablonlar', label: 'Shablonlar', icon: '📋' },
  { path: '/mutaxassisliklar', label: 'Mutaxassisliklar', icon: '🏷️' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">IT Klaster</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item"
            style={{ width: '100%', border: 'none', background: 'none',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
            onClick={authApi.logout}
          >
            <span className="nav-icon">🚪</span>
            <span>Chiqish</span>
          </button>
          <span className="sidebar-version">v1.0.0</span>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="main-wrapper">
        <header className="topbar">
          <button
            className="btn btn-ghost btn-icon menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <span className="topbar-title">Sertifikat Boshqaruv Tizimi</span>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}