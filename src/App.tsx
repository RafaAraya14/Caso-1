import React from 'react';
import './styles/globals.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth';
import LoginPage from './components/auth/LoginForm';
import { DashboardPage } from './components/dashboard';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}
