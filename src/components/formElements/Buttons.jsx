import clsx from 'clsx';
import PropTypes from 'prop-types';
import { OAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth } from 'reactfire';

export const LogInButton = () => {
  const auth = useAuth();

  const handleClick = () => {
    const provider = new OAuthProvider('oidc.utahid');
    provider.addScope('profile');
    provider.addScope('email');

    // @see https://firebase.google.com/docs/auth/web/google-signin
    signInWithPopup(auth, provider);
  };

  return (
    <Button onClick={handleClick} type="button">
      UtahID
    </Button>
  );
};
LogInButton.propTypes = {
  className: PropTypes.string,
};

export const LogOutButton = () => {
  const auth = useAuth();

  const handleClick = () => {
    auth.signOut();
  };

  return (
    <Button onClick={handleClick} type="button">
      Sign Out
    </Button>
  );
};
LogOutButton.propTypes = {
  className: PropTypes.string,
};

const primaryClasses =
  'h-8 border-indigo-600 bg-indigo-500 text-white hover:border-indigo-700 hover:bg-indigo-600 focus:border-indigo-500 focus:ring-indigo-600 active:bg-indigo-700';
const secondaryClasses =
  'h-8 border-yellow-500 bg-yellow-400 text-black hover:border-yellow-600 hover:bg-yellow-500 focus:border-yellow-400 focus:ring-yellow-500 active:bg-yellow-600';
const alternateClasses =
  'h-8 border-slate-400 bg-slate-100 text-slate-900 hover:text-white hover:border-slate-500 hover:bg-slate-400 focus:border-slate-500 focus:ring-slate-500 active:bg-slate-600 active:text-white';

const noButtonGroup = 'rounded-full';
const buttonGroupLeft = 'border-r-0 rounded-l-full';
const buttonGroupRight = 'border-l-0 rounded-r-full';
const buttonGroupMiddle = 'border-x-0';

export const Button = ({
  children,
  name,
  type,
  style,
  state,
  inputRef,
  onClick,
  buttonGroup,
}) => {
  return (
    <button
      type={type}
      name={name}
      ref={inputRef}
      disabled={state === 'disabled'}
      onClick={onClick}
      className={clsx(
        'flex min-h-[2rem] w-fit cursor-pointer items-center justify-center border-2 px-7 py-1 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50',
        style === 'primary' && primaryClasses,
        style === 'secondary' && secondaryClasses,
        style === 'alternate' && alternateClasses,
        !buttonGroup && noButtonGroup,
        buttonGroup?.left && buttonGroupLeft,
        buttonGroup?.middle && buttonGroupMiddle,
        buttonGroup?.right && buttonGroupRight
      )}
    >
      {state === 'loading' && (
        <svg
          className="-ml-1 mr-2 h-5 w-5 animate-spin motion-reduce:hidden"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

Button.propTypes = {
  /**
   * The property name used by react hook form
   */
  name: PropTypes.string,
  /**
   * The children to display on the button
   */
  children: PropTypes.string.isRequired,
  /**
   * The style of button
   */
  style: PropTypes.oneOf(['primary', 'secondary', 'alternate']),
  /**
   * The state of button
   */
  state: PropTypes.oneOf(['idle', 'disabled', 'loading']),
  /**
   * The property name used by react hook form
   */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  /**
   * The ref property for use with registering with react hook form
   */
  inputRef: PropTypes.func,
  /**
   * The function to execute when the button is clicked
   */
  onClick: PropTypes.func,
  dark: PropTypes.bool,
  buttonGroup: PropTypes.object,
};

Button.defaultProps = {
  name: null,
  type: 'button',
  style: 'primary',
  inputRef: null,
  onClick: undefined,
  buttonGroup: undefined,
};
