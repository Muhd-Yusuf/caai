import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Detect from './pages/Detect';
import Register from './pages/Register';
import HowToUseACT from './pages/HowToUseACT';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminConfig from './pages/admin/AdminConfig';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <div className="min-h-screen bg-white">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/detect" element={<Detect />} />
              <Route path="/register" element={<Register />} />
              <Route path="/how-to-use-act" element={<HowToUseACT />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/config"
                element={
                  <AdminRoute>
                    <AdminConfig />
                  </AdminRoute>
                }
              />
            </Routes>
            <Footer />
          </div>
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
