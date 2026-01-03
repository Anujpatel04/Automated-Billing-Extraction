/**
 * Main App component with routing
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { UserDashboard } from '@/pages/user/Dashboard';
import { Expenses } from '@/pages/user/Expenses';
import { Profile } from '@/pages/user/Profile';
import { HRDashboard } from '@/pages/hr/HRDashboard';
import { HRExpenses } from '@/pages/hr/HRExpenses';
import { HRUsers } from '@/pages/hr/Users';
import { useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui/ToastProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated() ? (
            <Navigate to={user?.role === 'HR' ? '/hr/dashboard' : '/dashboard'} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated() ? (
            <Navigate to={user?.role === 'HR' ? '/hr/dashboard' : '/dashboard'} replace />
          ) : (
            <Register />
          )
        }
      />

      {/* User routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <Expenses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['USER']}>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* HR routes */}
      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/expenses"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HRExpenses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/users"
        element={
          <ProtectedRoute allowedRoles={['HR']}>
            <HRUsers />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated() ? (user?.role === 'HR' ? '/hr/dashboard' : '/dashboard') : '/login'}
            replace
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;

