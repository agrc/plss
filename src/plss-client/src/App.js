import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
import reduce, { defaults } from './AppReducer';
import Map from './components/Map/Map';
import Menu, { Drawer } from './components/Menu/Menu';

const App = () => {
  const [state, dispatch] = useImmerReducer(reduce, defaults);

  return (
    <Router>
      <main className="grid w-screen h-screen app">
        <Map state={state.map} color={state.addPoint.color} dispatch={dispatch} />
        <Menu dispatch={dispatch} />
        <Drawer {...state} dispatch={dispatch} />
      </main>
    </Router>
  );
};

export default App;
