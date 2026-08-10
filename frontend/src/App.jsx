import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </Router>

        <ToastContainer />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
