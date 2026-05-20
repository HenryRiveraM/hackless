import { useCallback, useState } from 'react';

export default function useToasts() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type: 'success', ...toast }]);
    window.setTimeout(() => dismiss(id), 3600);
  }, [dismiss]);

  return { dismiss, showToast, toasts };
}
