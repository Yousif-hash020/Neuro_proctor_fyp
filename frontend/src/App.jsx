import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SessionManagement from './pages/SessionManagement';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminInvigilators from './pages/admin/AdminInvigilators';
import LiveMonitoring from './pages/LiveMonitoring';
import AlertsCenter from './pages/AlertsCenter';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes Wrapper */}
            <Route path="/app" element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="sessions" element={<SessionManagement />} />
                <Route path="live-monitoring" element={<LiveMonitoring />} />
                <Route path="alerts" element={<AlertsCenter />} />
                <Route path="reports" element={<Reports />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/students" element={<AdminStudents />} />
                <Route path="admin/invigilators" element={<AdminInvigilators />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;