import { useImmerReducer } from 'use-immer';
import AddPoint from './components/AddPoint';
import Map from './components/Map/Map';
import MapLayers from './components/MapLayers';
import Menu, { Drawer } from './components/Menu/Menu';
import MyContent from './components/MyContent';
import Login from './components/User';

const reduce = (draft, action) => {
  switch (action.type) {
    case 'sidebar': {
      // same component is visible -> toggle it
      if (draft.trayItem === action.payload) {
        draft.drawerOpen = !draft.drawerOpen;
      } else {
        draft.drawerOpen = true;
      }

      draft.trayItem = action.payload;
      switch (action.payload) {
        case 'layers': {
          draft.component = <MapLayers></MapLayers>;
          break;
        }
        case 'content': {
          draft.component = <MyContent></MyContent>;
          break;
        }
        case 'point': {
          draft.component = <AddPoint></AddPoint>;
          break;
        }
        case 'login': {
          draft.component = <Login></Login>;
          break;
        }
        default: {
          draft.component = null;
        }
      }
      break;
    }
    default:
      return;
  }
};

function App() {
  const [state, dispatch] = useImmerReducer(reduce, {
    drawerOpen: false,
    component: null,
  });

  return (
    <>
      <main className="grid w-screen h-screen app">
        <Map />
        <Menu open={state.drawerOpen} dispatch={dispatch} />
        <Drawer open={state.drawerOpen} component={state.component} />
      </main>
    </>
  );
}

export default App;
