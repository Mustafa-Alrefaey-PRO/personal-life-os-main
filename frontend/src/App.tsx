import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { PageLoader } from './components/ui/Spinner';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { GuestRoute } from './components/layout/GuestRoute';
import { useAuthStore } from './stores/authStore';
import { ToastProvider } from './components/ui/Toast';

// Each page is its own chunk, so e.g. the charts library only loads with the dashboard
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const BillsPage = lazy(() => import('./pages/BillsPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const ReceiptsPage = lazy(() => import('./pages/ReceiptsPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
// "new" and details pages: /section/new creates a record, /section/:id shows it, editable
const TaskFormPage = lazy(() => import('./pages/TaskFormPage'));
const BillFormPage = lazy(() => import('./pages/BillFormPage'));
const JournalFormPage = lazy(() => import('./pages/JournalFormPage'));
const ReceiptFormPage = lazy(() => import('./pages/ReceiptFormPage'));
const TransactionFormPage = lazy(() => import('./pages/TransactionFormPage'));

const queryClient = new QueryClient();

function AppRoutes() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/dashboard"     element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/tasks"         element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/bills"         element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
      <Route path="/journal"       element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
      <Route path="/receipts"      element={<ProtectedRoute><ReceiptsPage /></ProtectedRoute>} />
      <Route path="/transactions"  element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
      <Route path="/tasks/new"            element={<ProtectedRoute><TaskFormPage /></ProtectedRoute>} />
      <Route path="/tasks/:id"            element={<ProtectedRoute><TaskFormPage /></ProtectedRoute>} />
      <Route path="/bills/new"            element={<ProtectedRoute><BillFormPage /></ProtectedRoute>} />
      <Route path="/bills/:id"            element={<ProtectedRoute><BillFormPage /></ProtectedRoute>} />
      <Route path="/journal/new"          element={<ProtectedRoute><JournalFormPage /></ProtectedRoute>} />
      <Route path="/journal/:id"          element={<ProtectedRoute><JournalFormPage /></ProtectedRoute>} />
      <Route path="/receipts/new"         element={<ProtectedRoute><ReceiptFormPage /></ProtectedRoute>} />
      <Route path="/receipts/:id"         element={<ProtectedRoute><ReceiptFormPage /></ProtectedRoute>} />
      <Route path="/transactions/new"     element={<ProtectedRoute><TransactionFormPage /></ProtectedRoute>} />
      <Route path="/transactions/:id"     element={<ProtectedRoute><TransactionFormPage /></ProtectedRoute>} />
      <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/account/profile"  element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
      <Route path="/account/password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
      <Route path="/"   element={<Navigate to="/dashboard" replace />} />
      <Route path="*"   element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
