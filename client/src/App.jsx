import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ToastProvider } from './components/ui/Toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
    checkAuth();
  }, []);

  return (
    <ToastProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </ToastProvider>
  );
}

export default App;