import { useWindowHeight } from '@react-hook/window-size/throttled';
import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
import reduce, { defaults } from './AppReducer';
import Map from './components/Map/Map';
import Menu, { Drawer } from './components/Menu/Menu';

const App = () => {
  const [state, dispatch] = useImmerReducer(reduce, defaults);
  const height = useWindowHeight();

  React.useEffect(() => {
    const vh = height * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, [height]);

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <main className="grid w-screen h-full app">
        <Map state={state.map} color={state.addPoint.color} dispatch={dispatch} />
        <Menu />
        <Drawer {...state} dispatch={dispatch} />
      </main>
    </Router>
  );
};

export default App;
