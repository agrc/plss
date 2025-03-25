import { FolderIcon, HomeModernIcon, PlusCircleIcon, SwatchIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useFirebaseAuth } from '@ugrc/utah-design-system';
import clsx from 'clsx';
import PropTypes from 'prop-types';

export default function Menu({ dispatch, drawerOpen }) {
  const { currentUser } = useFirebaseAuth();

  const classes = clsx(
    ['menu', 'z-20', 'flex', 'py-4', 'bg-slate-800/95', 'shadow-sm', 'menu', 'md:justify-between', 'justify-evenly'],
    {
      'menu--open': drawerOpen,
    },
  );

  return (
    <nav className={classes}>
      <MenuItem Icon={HomeModernIcon} onClick={() => dispatch({ type: 'menu/toggle', payload: 'welcome' })}>
        Home
      </MenuItem>
      <MenuItem Icon={SwatchIcon} onClick={() => dispatch({ type: 'menu/toggle', payload: 'legend' })}>
        Map Legend
      </MenuItem>
      {currentUser !== undefined && (
        <>
          <MenuItem Icon={PlusCircleIcon} onClick={() => dispatch({ type: 'menu/toggle', payload: 'points' })}>
            Add Reference Point
          </MenuItem>
          <MenuItem Icon={FolderIcon} onClick={() => dispatch({ type: 'menu/toggle', payload: 'content' })}>
            My Content
          </MenuItem>
        </>
      )}
      <MenuItem Icon={UserCircleIcon} onClick={() => dispatch({ type: 'menu/toggle', payload: 'login' })}>
        {currentUser !== undefined ? 'Profile' : 'Login/Register'}
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
      className="hover: relative flex flex-col items-center justify-center fill-current text-xs text-sky-500 transition-colors select-none hover:text-sky-300"
      onClick={onClick}
    >
      {Icon && <Icon className="h-10 w-10" />}
      <p className="pt-1">{children}</p>
    </button>
  );
};

MenuItem.propTypes = {
  Icon: PropTypes.object,
  children: PropTypes.string,
  onClick: PropTypes.func,
};
