import { faFolder, faMapMarkedAlt, faMapMarker, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import * as React from 'react';
import { Link, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import AddPoint from '../AddPoint';
import CornerSubmission from '../CornerSubmission/CornerSubmission';
import Identify from '../Identify';
import Logo from '../Logo';
import MyContent from '../MyContent';
import Login from '../User';

const Menu = () => {
  const open = useDrawerOpen();

  const classes = clsx(
    ['menu', 'z-10', 'flex', 'py-4', 'bg-gray-900', 'shadow', 'md:z-0', 'menu', 'md:justify-between', 'justify-evenly'],
    {
      'menu--open': open,
    }
  );

  return (
    <nav className={classes}>
      <Logo />
      <MenuItem icon={faMapMarkedAlt} route="/submission/new">
        Submit
      </MenuItem>
      <MenuItem icon={faFolder} route="/my-content">
        My Content
      </MenuItem>
      <MenuItem icon={faMapMarker} route="/add-point">
        Add Point
      </MenuItem>
      <MenuItem icon={faUser} route="/login">
        Login/Register
      </MenuItem>
    </nav>
  );
};

const MenuItem = ({ icon, children, onClick, route }) => {
  const history = useHistory();

  return (
    <Link
      to={() => {
        if (history.location.pathname === route) {
          return '/';
        } else {
          return route;
        }
      }}
      className="relative flex flex-col items-center justify-center text-xs text-indigo-300 select-none fill-current"
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} fixedWidth size="2x" />
      <p className="pt-1 ">{children}</p>
    </Link>
  );
};

export function Drawer({ dispatch, authenticated, graphic, map, addPoint }) {
  const open = useDrawerOpen();

  const classes = clsx(
    [
      'flex',
      'flex-col',
      'drawer',
      'bg-gray-600',
      'text-white',
      'max-w-screen',
      'shadow-2xl',
      'border',
      'border-indigo-700',
      'rounded-t-2xl',
      'sm:rounded-t-none',
      'px-4',
      'pt-4',
      'overflow-hidden',
    ],
    {
      'drawer--closed': !open,
    }
  );

  return (
    <aside className={classes}>
      <Switch>
        <Route path="/submission" render={() => <CornerSubmission />} />
        <Route path="/my-content" exact component={MyContent} />
        <Route
          path="/add-point"
          exact
          render={() => <AddPoint {...addPoint} active={map.activeTool === 'add-point'} dispatch={dispatch} />}
        />
        <Route exact path="/login" render={() => <Login dispatch={dispatch} authenticated={authenticated} />} />
        <Route path="/identify" exact render={() => <Identify graphic={graphic} />} />
        <Route render={() => <></>} />
      </Switch>
    </aside>
  );
}

const useDrawerOpen = () => {
  const location = useLocation();
  const [drawOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    console.log('path changed');
    setDrawerOpen(location?.pathname !== '/');
  }, [location.pathname]);

  return drawOpen;
};

export default Menu;
