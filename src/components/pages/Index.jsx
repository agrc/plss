import { useImmerReducer } from 'use-immer';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { useFirebaseApp, FunctionsProvider } from 'reactfire';
import reduce, { defaults } from '../reducers/AppReducer';
import Drawer from '../layoutElements/Drawer.jsx';
import Menu from '../layoutElements/Menu.jsx';
import Map from '../pageElements/Map.jsx';

export default function Index() {
  const [state, dispatch] = useImmerReducer(reduce, defaults);
  const app = useFirebaseApp();
  const functions = getFunctions(app);

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
        window['_firebase_function'] = true;
      }
    }
  }

  return (
    <FunctionsProvider sdk={functions}>
      <Map state={state.map} color={state.addPoint.color} dispatch={dispatch} />
      <Menu>menu</Menu>
      <Drawer {...state} dispatch={dispatch} />
    </FunctionsProvider>
  );
}
