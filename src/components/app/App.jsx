import { useImmerReducer } from 'use-immer';
import Drawer from '../layoutElements/Drawer.jsx';
import Menu from '../layoutElements/Menu.jsx';
import Map from '../pageElements/Map.jsx';
import reduce, { defaults } from '../reducers/AppReducer';

export default function App() {
  const [state, dispatch] = useImmerReducer(reduce, defaults);

  return (
    <main className="app grid h-full w-screen">
      <Map state={state.map} color={state.addPoint.color} drawerOpen={state.drawerOpen} dispatch={dispatch} />
      <Menu drawerOpen={state.drawerOpen} dispatch={dispatch}>
        menu
      </Menu>
      <Drawer {...state} dispatch={dispatch} />
    </main>
  );
}
