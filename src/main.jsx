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
import { StrictMode } from 'react';
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

const provider = new OAuthProvider('oidc.ping');
provider.addScope('profile');
provider.addScope('email');

if (import.meta.env.VITE_FIREBASE_CONFIG) {
  firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
}

createRoot(document.getElementById('root')).render(
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
  </QueryClientProvider>,
);
