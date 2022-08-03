import PropTypes from 'prop-types';
import { useDrawerOpen } from './Drawer.jsx';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  PlusCircleIcon,
  UserCircleIcon,
  ColorSwatchIcon,
} from '@heroicons/react/outline';
import { useAuthState } from '../contexts/AuthContext.jsx';

export default function Menu() {
  const open = useDrawerOpen();
  const { state: userState } = useAuthState();

  const classes = clsx(
    [
      'menu',
      'z-20',
      'flex',
      'py-4',
      'bg-slate-900',
      'shadow',
      'menu',
      'md:justify-between',
      'justify-evenly',
    ],
    {
      'menu--open': open,
    }
  );

  return (
    <nav className={classes}>
      <MenuItem Icon={UserCircleIcon} route="/login">
        {userState.state === 'SIGNED_IN' ? 'Logout' : 'Login/Register'}
      </MenuItem>
      {userState.state === 'SIGNED_IN' && (
        <>
          <MenuItem Icon={PlusCircleIcon} route="/add-point">
            Add Point
          </MenuItem>
          <MenuItem Icon={FolderIcon} route="/my-content">
            My Content
          </MenuItem>
        </>
      )}
      <MenuItem Icon={ColorSwatchIcon} route="/legend">
        Map Legend
      </MenuItem>
    </nav>
  );
}

const MenuItem = ({ Icon, children, onClick, route }) => {
  if (window.location.pathname === route) {
    route = '/';
  }

  return (
    <Link
      to={route}
      className="relative flex select-none flex-col items-center justify-center fill-current text-xs text-indigo-300"
      onClick={onClick}
    >
      {Icon && <Icon className="h-10 w-10 text-indigo-500" />}
      <p className="pt-1">{children}</p>
    </Link>
  );
};

MenuItem.propTypes = {
  Icon: PropTypes.object,
  children: PropTypes.string,
  onClick: PropTypes.func,
  route: PropTypes.string.isRequired,
};
