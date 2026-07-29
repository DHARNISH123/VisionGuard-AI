import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/AppShell';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cameras from './pages/Cameras';
import Incidents from './pages/Incidents';
import Policies from './pages/Policies';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import About from './pages/About';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Pages */}
      <Route 
        path="/landing" 
        element={<Navigate to="/" replace />} 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/" replace /> : <Register />} 
      />

      {/* Protected Pages (Inside AppShell Layout) */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/cameras" 
        element={
          <ProtectedRoute>
            <AppShell>
              <Cameras />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/incidents" 
        element={
          <ProtectedRoute>
            <AppShell>
              <Incidents />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/policies" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Supervisor']}>
            <AppShell>
              <Policies />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Supervisor']}>
            <AppShell>
              <Analytics />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/settings" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AppShell>
              <Settings />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/about" 
        element={
          <ProtectedRoute>
            <AppShell>
              <About />
            </AppShell>
          </ProtectedRoute>
        } 
      />

      {/* Catch-all Routing redirects to Dashboard */}
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
