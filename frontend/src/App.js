import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import LoginPage from './pages/LoginPage';
import CertificatesListPage from './pages/CertificatesListPage';
import CertificateCreatePage from './pages/CertificateCreatePage';
import TemplatesPage from './pages/TemplatesPage';
import SpecializationsPage from './pages/SpecializationsPage';
import VerifyPage from './pages/VerifyPage';
import { authApi } from './services/api';
import './styles/global.css';

// Himoyalangan route — token bo'lmasa /login ga yo'naltiradi
function PrivateRoute({ children }) {
  return authApi.isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Ommaviy tekshiruv sahifasi — token shart emas */}
        <Route path="/verify/:code" element={<VerifyPage />} />

        {/* Himoyalangan sahifalar — sidebar ichida */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/sertifikatlar" replace />} />
                  <Route path="/sertifikatlar" element={<CertificatesListPage />} />
                  <Route path="/sertifikatlar/yangi" element={<CertificateCreatePage />} />
                  <Route path="/sertifikatlar/:id/tahrirlash" element={<CertificateCreatePage />} />
                  <Route path="/shablonlar" element={<TemplatesPage />} />
                  <Route path="/kurslar" element={<SpecializationsPage />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;