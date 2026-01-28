import '@arcgis/core/assets/esri/themes/light/main.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  FirebaseAnalyticsProvider,
  FirebaseAppProvider,
  FirebaseAuthProvider,
  FirebaseFunctionsProvider,
  FirebaseStorageProvider,
  FirestoreProvider,
} from '@ugrc/utah-design-system';
import { OAuthProvider } from 'firebase/auth';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/app/App.jsx';
import './index.css';

let firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

if (import.meta.env.VITE_FIREBASE_CONFIG) {
  firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
}

const OAUTH_PROVIDERS = {
  'oidc.ping': 'Ping Identity',
  'oidc.utahid': 'Utah ID',
  'oidc.entra': 'Microsoft Entra',
};

function Root() {
  const [selectedProvider, setSelectedProvider] = useState('oidc.utahid');

  const provider = new OAuthProvider(selectedProvider);
  provider.addScope('profile');
  provider.addScope('email');

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 9999,
          padding: '10px 15px',
          background: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <label htmlFor="oauth-provider" style={{ marginRight: '10px', fontWeight: 'bold', fontSize: '14px' }}>
          OIDC Provider:
        </label>
        <select
          id="oauth-provider"
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {Object.entries(OAUTH_PROVIDERS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: {
              queries: {
                refetchOnWindowFocus: false,
              },
            },
          })
        }
      >
        <StrictMode>
          <FirebaseAppProvider config={firebaseConfig}>
            <FirebaseAnalyticsProvider>
              <FirebaseAuthProvider provider={provider}>
                <FirebaseFunctionsProvider>
                  <FirebaseStorageProvider>
                    <FirestoreProvider>
                      <App />
                      <ReactQueryDevtools />
                    </FirestoreProvider>
                  </FirebaseStorageProvider>
                </FirebaseFunctionsProvider>
              </FirebaseAuthProvider>
            </FirebaseAnalyticsProvider>
          </FirebaseAppProvider>
        </StrictMode>
      </QueryClientProvider>
    </>
  );
}

createRoot(document.getElementById('root')).render(<Root />);
