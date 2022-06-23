import reduce, { defaults } from '../reducers/AppReducer';
import { useImmerReducer } from 'use-immer';
import Drawer from '../layoutElements/Drawer.jsx';
import Menu from '../layoutElements/Menu.jsx';
import Map from '../pageElements/Map.jsx';

export default function Index() {
  const [state, dispatch] = useImmerReducer(reduce, defaults);

  return (
    <>
      <Map state={state.map} color={state.addPoint.color} dispatch={dispatch} />
      <Menu>menu</Menu>
      <Drawer {...state} dispatch={dispatch} />
    </>
  );
}
