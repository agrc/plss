import { useImmerReducer } from 'use-immer';
import {
  AuthProvider,
  useFirebaseApp,
  FunctionsProvider,
  StorageProvider,
} from 'reactfire';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import reduce, { defaults } from '../reducers/AppReducer';
import Drawer from '../layoutElements/Drawer.jsx';
import Menu from '../layoutElements/Menu.jsx';
import Map from '../pageElements/Map.jsx';

export default function App() {
  const [state, dispatch] = useImmerReducer(reduce, defaults);
  const app = useFirebaseApp();
  const functions = getFunctions(app);
  const storage = getStorage(app);
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

    if (
      typeof window === 'undefined' ||
      !window['_firebase_functions_emulator']
    ) {
      try {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      } catch {
        console.log('functions emulator already connected');
      }
      if (typeof window !== 'undefined') {
        window['_firebase_function_emulator'] = true;
      }
    }

    if (
      typeof window === 'undefined' ||
      !window['_firebase_storage_emulator']
    ) {
      try {
        connectStorageEmulator(storage, 'localhost', 9199);
      } catch {
        console.log('storage emulator already connected');
      }
      if (typeof window !== 'undefined') {
        window['_firebase_storage_emulator'] = true;
      }
    }
  }

  return (
    <AuthProvider sdk={auth}>
      <FunctionsProvider sdk={functions}>
        <StorageProvider sdk={storage}>
          <main className="app grid h-full w-screen">
            <Map
              state={state.map}
              color={state.addPoint.color}
              drawerOpen={state.drawerOpen}
              dispatch={dispatch}
            />
            <Menu drawerOpen={state.drawerOpen} dispatch={dispatch}>
              menu
            </Menu>
            <Drawer {...state} dispatch={dispatch} />
          </main>
        </StorageProvider>
      </FunctionsProvider>
    </AuthProvider>
  );
}
