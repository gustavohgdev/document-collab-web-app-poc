import { useState, useEffect } from 'react';

export function useAutoDismissError(dismissTime = 5000) {
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, dismissTime);

      return () => clearTimeout(timer);
    }
  }, [error, dismissTime]);

  return [error, setError] as const;
}
