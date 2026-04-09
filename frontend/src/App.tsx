import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './shell/Layout';
import LoginPage from './modules/auth/pages/LoginPage';
import { AuthProvider, useAuth } from './core/auth/AuthContext';

function AuthGuardedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<AuthGuardedLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
