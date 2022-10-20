import { useImmerReducer } from 'use-immer';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { useFirebaseApp, FunctionsProvider, StorageProvider } from 'reactfire';
import reduce, { defaults } from '../reducers/AppReducer';
import Drawer from '../layoutElements/Drawer.jsx';
import Menu from '../layoutElements/Menu.jsx';
import Map from '../pageElements/Map.jsx';

export default function Index() {
  const [state, dispatch] = useImmerReducer(reduce, defaults);
  const app = useFirebaseApp();
  const functions = getFunctions(app);
  const storage = getStorage(app);

  if (import.meta.env.DEV) {
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
    <FunctionsProvider sdk={functions}>
      <StorageProvider sdk={storage}>
        <Map
          state={state.map}
          color={state.addPoint.color}
          dispatch={dispatch}
        />
        <Menu drawerOpen={state.drawerOpen} dispatch={dispatch}>
          menu
        </Menu>
        <Drawer {...state} dispatch={dispatch} />
      </StorageProvider>
    </FunctionsProvider>
  );
}
