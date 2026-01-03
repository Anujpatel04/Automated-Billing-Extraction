/**
 * Role-based access control hook
 */
import { useAuth } from './useAuth';

export const useRole = () => {
  const { user } = useAuth();

  const isHR = () => user?.role === 'HR';
  const isUser = () => user?.role === 'USER';
  const hasRole = (role: 'USER' | 'HR') => user?.role === role;

  return {
    isHR,
    isUser,
    hasRole,
    role: user?.role,
  };
};




