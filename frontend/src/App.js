import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import CertificatesListPage from './pages/CertificatesListPage';
import CertificateCreatePage from './pages/CertificateCreatePage';
import TemplatesPage from './pages/TemplatesPage';
import SpecializationsPage from './pages/SpecializationsPage';
import VerifyPage from './pages/VerifyPage';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public verification page — no sidebar */}
        <Route path="/verify/:code" element={<VerifyPage />} />

        {/* All other pages inside the sidebar layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/sertifikatlar" replace />} />
                <Route path="/sertifikatlar" element={<CertificatesListPage />} />
                <Route path="/sertifikatlar/yangi" element={<CertificateCreatePage />} />
                <Route path="/sertifikatlar/:id/tahrirlash" element={<CertificateCreatePage />} />
                <Route path="/shablonlar" element={<TemplatesPage />} />
                <Route path="/mutaxassisliklar" element={<SpecializationsPage />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;