import { Router } from '../router/Router.jsx';
import { AuthProvider, useFirebaseApp } from 'reactfire';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

export default function App() {
  const app = useFirebaseApp();
  const auth = getAuth(app);

  if (import.meta.env.DEV) {
    if (typeof window === 'undefined' || !window['_firebase_auth_emulator']) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', {
          disableWarnings: true,
        });
      } catch {
        console.log('auth emulator already connected');
      }
      if (typeof window !== 'undefined') {
        window['_firebase_auth_emulator'] = true;
      }
    }
  }

  return (
    <AuthProvider sdk={auth}>
      <Router />
    </AuthProvider>
  );
}
