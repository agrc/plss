import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  FolderIcon,
  PlusCircleIcon,
  UserCircleIcon,
  SwatchIcon,
  HomeModernIcon,
} from '@heroicons/react/24/outline';
import { useUser } from 'reactfire';

export default function Menu({ dispatch, drawerOpen }) {
  const { data: user } = useUser();

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
      'menu--open': drawerOpen,
    }
  );

  return (
    <nav className={classes}>
      <MenuItem
        Icon={HomeModernIcon}
        onClick={() => dispatch({ type: 'menu/toggle', payload: 'welcome' })}
      >
        Home
      </MenuItem>
      <MenuItem
        Icon={SwatchIcon}
        onClick={() => dispatch({ type: 'menu/toggle', payload: 'legend' })}
      >
        Map Legend
      </MenuItem>
      {user !== null && (
        <>
          <MenuItem
            Icon={PlusCircleIcon}
            onClick={() => dispatch({ type: 'menu/toggle', payload: 'points' })}
          >
            Add Point
          </MenuItem>
          <MenuItem
            Icon={FolderIcon}
            onClick={() =>
              dispatch({ type: 'menu/toggle', payload: 'content' })
            }
          >
            My Content
          </MenuItem>
        </>
      )}
      <MenuItem
        Icon={UserCircleIcon}
        onClick={() => dispatch({ type: 'menu/toggle', payload: 'login' })}
      >
        {user !== null ? 'Logout' : 'Login/Register'}
      </MenuItem>
    </nav>
  );
}
Menu.propTypes = {
  dispatch: PropTypes.func,
  drawerOpen: PropTypes.bool,
};

const MenuItem = ({ Icon, children, onClick }) => {
  return (
    <button
      className="relative flex select-none flex-col items-center justify-center fill-current text-xs text-indigo-300"
      onClick={onClick}
    >
      {Icon && <Icon className="h-10 w-10 text-indigo-500" />}
      <p className="pt-1">{children}</p>
    </button>
  );
};

MenuItem.propTypes = {
  Icon: PropTypes.object,
  children: PropTypes.string,
  onClick: PropTypes.func,
};
