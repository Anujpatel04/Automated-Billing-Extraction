/**
 * Toast notification hook
 */
import { useState, useCallback } from 'react';
import { Toast, ToastType } from '@/components/ui/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string) => {
    return showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    return showToast(message, 'error');
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    return showToast(message, 'warning');
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    return showToast(message, 'info');
  }, [showToast]);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
  };
};





