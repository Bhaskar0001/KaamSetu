import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/WorkerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import ThekedarDashboard from './pages/ThekedarDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkerProfile from './pages/WorkerProfile';
import CreateJob from './pages/CreateJob';
import MarkAttendance from './pages/MarkAttendance';
import WalletPage from './pages/WalletPage';
import ContractPage from './pages/ContractPage';
import KYCVerification from './pages/KYCVerification';
import TodayScreen from './pages/TodayScreen';

// Helper for safe parsing
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    localStorage.removeItem('user');
    return {};
  }
};

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const user = getUser();

  if (!token) {
    return <Navigate to='/login' />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to='/' />;
  }

  return children;
}

// Home Redirect based on Role
function HomeRedirect() {
  const user = getUser();
  if (user.role === 'admin') return <Navigate to='/admin' />;
  if (user.role === 'worker') return <Navigate to='/worker' />;
  if (user.role === 'thekedar') return <Navigate to='/thekedar' />;
  if (user.role === 'owner') return <Navigate to='/owner' />;
  return <Navigate to='/login' />;
}

function App() {
  return (
    <LanguageProvider>

      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Home Redirect */}
          <Route path='/' element={<HomeRedirect />} />

          {/* New Today Screen */}
          <Route path='/today' element={
            <ProtectedRoute allowedRoles={['worker', 'thekedar']}>
              <TodayScreen />
            </ProtectedRoute>
          } />

          {/* Worker Routes */}
          <Route path='/worker' element={
            <ProtectedRoute allowedRoles={['worker']}>
              <WorkerDashboard />
            </ProtectedRoute>
          } />
          <Route path='/worker/attendance' element={
            <ProtectedRoute allowedRoles={['worker']}>
              <MarkAttendance />
            </ProtectedRoute>
          } />

          {/* Owner Routes */}
          <Route path='/owner' element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path='/create-job' element={
            <ProtectedRoute allowedRoles={['owner', 'thekedar']}>
              <CreateJob />
            </ProtectedRoute>
          } />

          {/* Thekedar Routes */}
          <Route path='/thekedar' element={
            <ProtectedRoute allowedRoles={['thekedar']}>
              <ThekedarDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path='/admin' element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Contract Route */}
          <Route path='/contract/:id' element={
            <ProtectedRoute>
              <ContractPage />
            </ProtectedRoute>
          } />

          {/* Shared Routes */}
          <Route path='/wallet' element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          } />
          <Route path='/profile' element={
            <ProtectedRoute>
              <WorkerProfile />
            </ProtectedRoute>
          } />

          <Route path='/kyc' element={
            <ProtectedRoute>
              <KYCVerification />
            </ProtectedRoute>
          } />

          {/* Legacy/Fallback */}
          <Route path='/worker-feed' element={<Navigate to='/worker' />} />
          <Route path='/mark-attendance' element={<Navigate to='/worker/attendance' />} />
        </Routes>
        <ToastContainer position="top-center" autoClose={3000} />
      </Router>
    </LanguageProvider>
  );
}

export default App;
