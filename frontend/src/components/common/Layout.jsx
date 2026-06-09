import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">O'quv Markazi</span>
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
          <span className="sidebar-version">v1.0.0</span>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
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