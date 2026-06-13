import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Auth shell: uses full viewport, no max-width constraint
function AuthShell({ children }) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#0e0e14',
    }}>
      {children}
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthRoute) {
    return (
      <AuthShell>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AuthShell>
    );
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
