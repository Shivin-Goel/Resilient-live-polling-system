import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import RoleSelection from './pages/RoleSelection';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentView from './pages/StudentView';

const PrivateRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole: 'teacher' | 'student' }) => {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/" />;
  }

  if (role !== requiredRole) {
    return <Navigate to={role === 'teacher' ? '/teacher' : '/student'} />;
  }

  return children;
};

const AppRoutes = () => {
  const { role } = useAuth();

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={role ? <Navigate to={role === 'teacher' ? '/teacher' : '/student'} /> : <RoleSelection />}
          />
          <Route
            path="/teacher/*"
            element={
              <PrivateRoute requiredRole="teacher">
                <TeacherDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/*"
            element={
              <PrivateRoute requiredRole="student">
                <StudentView />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default AppRoutes;
