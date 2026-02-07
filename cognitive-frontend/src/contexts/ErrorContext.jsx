import { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from '../components/ui/Alert';

const ErrorContext = createContext();

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const showError = useCallback((message, details = null) => {
    setError({ message, details });
    setTimeout(() => setError(null), 5000);
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, showSuccess, clearError, clearSuccess }}>
      {children}
      
      {/* Global Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
          <Alert variant="error" onClose={clearError}>
            <div>
              <p className="font-medium">{error.message}</p>
              {error.details && (
                <p className="text-sm mt-1 opacity-90">{error.details}</p>
              )}
            </div>
          </Alert>
        </div>
      )}

      {/* Global Success Toast */}
      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
          <Alert variant="success" onClose={clearSuccess}>
            <p className="font-medium">{success}</p>
          </Alert>
        </div>
      )}
    </ErrorContext.Provider>
  );
}
