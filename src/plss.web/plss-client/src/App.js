import { useImmerReducer } from 'use-immer';
import Map from './components/Map';
import { Drawer, LayerList, Menu, MyContent } from './components/Sidebar';

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
          draft.component = <LayerList></LayerList>;
          break;
        }
        case 'content': {
          draft.component = <MyContent></MyContent>;
          break;
        }
        case 'point': {
          break;
        }
        case 'login': {
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
    drawerOpen: true,
    component: <LayerList></LayerList>,
  });

  return (
    <>
      <main className="grid w-screen h-screen app">
        <Map />
        <Menu dispatch={dispatch} />
        <Drawer open={state.drawerOpen} component={state.component} />
      </main>
    </>
  );
}

export default App;
