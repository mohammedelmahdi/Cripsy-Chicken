/**
 * Main Application Entrance for Cripsy Chicken POS (Phase 0 Foundation)
 * Connects the localization engine, security credentials, and roleguards.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { UserRole } from './types';
import { localDb } from './db/localDb';
import { useEffect, useState, ReactNode } from 'react';

// Layout & Views
import AppShell from './layouts/AppShell';
import Login from './pages/Login';
import Pos from './pages/Pos';
import Tables from './pages/Tables';
import Orders from './pages/Orders';
import OnlineOrders from './pages/OnlineOrders';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import AuditLog from './pages/AuditLog';

// Role Guard Component
function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: ReactNode; 
  allowedRoles: UserRole[] 
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF7EE] flex items-center justify-center font-sans text-[#3E2A22]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#E54B2A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-extrabold text-sm uppercase tracking-wider">
            {language === 'ar' ? 'جاري التحميل...' : 'Initializing POS Engine...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.includes(user.role);
  if (!hasAccess) {
    // Elegant inline permission fallback card (no generic alert box!)
    return (
      <div className="min-h-[60vh] bg-white border border-red-100 rounded-2xl p-8 max-w-md mx-auto my-12 text-center flex flex-col justify-center items-center shadow-md font-sans text-[#3E2A22]">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-[#E54B2A] mb-4">
          <span className="text-2xl font-black">!</span>
        </div>
        <h3 className="text-lg font-extrabold text-[#E54B2A] mb-2">
          {language === 'ar' ? 'غير مصرح بالدخول' : 'Access Denied'}
        </h3>
        <p className="text-xs opacity-85 leading-relaxed mb-6">
          {language === 'ar' 
            ? 'حسابك الحالي لا يملك الصلاحيات الكافية للوصول إلى هذه الصفحة. الرجاء مراجعة مسؤول النظام.'
            : `Your current employee role (${user.role}) is restricted from viewing this administrative module.`}
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
}

function MainAppRoutes() {
  const [dbReady, setDbReady] = useState(false);

  // Initialize the IndexedDB on application startup
  useEffect(() => {
    localDb.init()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error('Failed to initialize IndexedDB:', err);
        // Fallback to ready anyway so UI loads
        setDbReady(true);
      });
  }, []);

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-[#FFF7EE] flex items-center justify-center text-[#3E2A22] font-sans">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#E54B2A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-extrabold text-xs tracking-wider uppercase">Loading Database Schema...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected App Core Views */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER, UserRole.KITCHEN]}>
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* POS (Cashier, Manager, Admin) */}
          <Route 
            index 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]}>
                <Pos />
              </ProtectedRoute>
            } 
          />

          {/* Tables (Cashier, Manager, Admin) */}
          <Route 
            path="tables" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]}>
                <Tables />
              </ProtectedRoute>
            } 
          />

          {/* Orders History (Cashier, Manager, Admin) */}
          <Route 
            path="orders" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]}>
                <Orders />
              </ProtectedRoute>
            } 
          />

          {/* Online Order Queue (Cashier, Manager, Admin) */}
          <Route 
            path="online-orders" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]}>
                <OnlineOrders />
              </ProtectedRoute>
            } 
          />

          {/* Products (Manager, Admin) */}
          <Route 
            path="products" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <Products />
              </ProtectedRoute>
            } 
          />

          {/* Inventory (Manager, Admin) */}
          <Route 
            path="inventory" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <Inventory />
              </ProtectedRoute>
            } 
          />

          {/* Suppliers (Manager, Admin) */}
          <Route 
            path="suppliers" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <Suppliers />
              </ProtectedRoute>
            } 
          />

          {/* Expenses (Manager, Admin) */}
          <Route 
            path="expenses" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <Expenses />
              </ProtectedRoute>
            } 
          />

          {/* Reports (Manager, Admin) */}
          <Route 
            path="reports" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <Reports />
              </ProtectedRoute>
            } 
          />

          {/* Staff (Manager, Admin) */}
          <Route 
            path="staff" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <Staff />
              </ProtectedRoute>
            } 
          />

          {/* Settings (Manager, Admin) */}
          <Route 
            path="settings" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* Audit Log (Admin Only) */}
          <Route 
            path="audit" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AuditLog />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Fallback Catchall */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppRoutes />
      </AuthProvider>
    </LanguageProvider>
  );
}
