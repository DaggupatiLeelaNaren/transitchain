import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SupportChatbotModal from './components/SupportChatbotModal';

import LandingPage from './pages/LandingPage';
import JourneySearchPage from './pages/JourneySearchPage';
import JourneyDetailPage from './pages/JourneyDetailPage';
import BookingsPage from './pages/BookingsPage';
import TrackingPage from './pages/TrackingPage';
import NearbyPlacesPage from './pages/NearbyPlacesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Route wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated && isAdmin ? children : <Navigate to="/" replace />;
};

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="glass-app flex flex-col min-h-screen">
      <Navbar onOpenChat={() => setIsChatOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<JourneySearchPage />} />
          <Route path="/journey/:id" element={<JourneyDetailPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/tracking/:journeyId" element={<TrackingPage />} />
          <Route path="/places" element={<NearbyPlacesPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected User */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={ <ProtectedRoute> <ProfilePage /> </ProtectedRoute> } />

          {/* Protected Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating Chatbot Assistant */}
      <SupportChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
