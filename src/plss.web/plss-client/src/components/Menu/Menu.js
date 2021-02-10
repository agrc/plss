import { faFolder, faMapMarkedAlt, faMapMarker, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import * as React from 'react';

const Menu = ({ dispatch }) => (
  <nav className="z-10 flex py-4 bg-gray-900 shadow menu justify-evenly">
    <MenuItem icon={faMapMarkedAlt} onClick={() => dispatch({ type: 'sidebar', payload: 'layers' })}>
      Map Layers
    </MenuItem>
    <MenuItem icon={faFolder} onClick={() => dispatch({ type: 'sidebar', payload: 'content' })}>
      My Content
    </MenuItem>
    <MenuItem icon={faMapMarker} onClick={() => dispatch({ type: 'sidebar', payload: 'point' })}>
      Add Point
    </MenuItem>
    <MenuItem icon={faUser} onClick={() => dispatch({ type: 'sidebar', payload: 'login' })}>
      Login/Register
    </MenuItem>
  </nav>
);

const MenuItem = ({ icon, children, onClick }) => (
  <div
    className="relative flex flex-col items-center justify-center text-xs text-indigo-300 select-none fill-current"
    onClick={onClick}
  >
    <FontAwesomeIcon icon={icon} fixedWidth size="2x" />
    <p className="pt-1 ">{children}</p>
  </div>
);

export function Drawer({ open, component }) {
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
      'px-4',
      'pt-4',
    ],
    {
      'drawer--closed': !open,
    }
  );

  return <aside className={classes}>{component}</aside>;
}

export default Menu;
