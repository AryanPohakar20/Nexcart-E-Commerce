import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App';
import './styles/index.css';

const rawGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const isGoogleClientIdConfigured = rawGoogleClientId && rawGoogleClientId.trim() !== '' && !rawGoogleClientId.includes('YOUR_ACTUAL');
const googleClientId = isGoogleClientIdConfigured
  ? rawGoogleClientId.trim()
  : 'unconfigured-client-id.apps.googleusercontent.com';

if (!isGoogleClientIdConfigured) {
  console.warn('[Google OAuth] VITE_GOOGLE_CLIENT_ID is not configured in frontend/.env');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
