import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { useFirebaseAuth } from '@ugrc/utah-design-system';
import { clsx } from 'clsx';
import PropTypes from 'prop-types';

export const LogInButton = () => {
  const { login } = useFirebaseAuth();

  const handleClick = () => {
    login();
  };

  return (
    <Button onClick={handleClick} type="button">
      <svg
        className="h-16 w-16 fill-current py-1 text-white"
        xmlns="http://www.w3.org/2000/svg"
        width="638.43"
        height="197"
        viewBox="0 0 638.43 197"
      >
        <g>
          <path
            d="M134.21,197a4,4,0,1,1,0-8l492-1a3.92,3.92,0,0,0,4-3.83V11.83a3.92,3.92,0,0,0-4-3.83l-518,1h0a4,4,0,1,1,0-8l518-1a11.93,11.93,0,0,1,12,11.83V184.17a11.93,11.93,0,0,1-12,11.83l-492,1Z"
            transform="translate(0.21 0)"
          />
          <g>
            <path
              d="M96.09,71.94A4.15,4.15,0,0,1,92,67.8v-20A34.6,34.6,0,0,0,57.48,13.28,34.79,34.79,0,0,0,23.87,40a4.14,4.14,0,0,1-8.07-1.87A43.15,43.15,0,0,1,57.48,5a42.87,42.87,0,0,1,42.75,42.76v20A4.14,4.14,0,0,1,96.09,71.94Z"
              transform="translate(0.21 0)"
            />
            <path
              d="M69,159c0,3.15-5.86,5.72-10.74,5.72S46.93,162.14,46.93,159l5.18-30.9a10.42,10.42,0,1,1,12.18-.34Z"
              transform="translate(0.21 0)"
            />
            <path
              d="M107.27,197H8.66a8.88,8.88,0,0,1-8.87-8.87V58a8.88,8.88,0,0,1,8.87-8.87H63.92A8.88,8.88,0,0,1,72.79,58v19a.6.6,0,0,0,.59.59h33.89a8.88,8.88,0,0,1,8.87,8.87V188.13A8.88,8.88,0,0,1,107.27,197ZM8.66,57.45a.6.6,0,0,0-.59.59V188.13a.6.6,0,0,0,.59.59h98.61a.61.61,0,0,0,.6-.59V86.54a.6.6,0,0,0-.6-.59H73.38a8.87,8.87,0,0,1-8.86-8.87V58a.59.59,0,0,0-.6-.59Z"
              transform="translate(0.21 0)"
            />
          </g>
          <g>
            <g>
              <path
                d="M162.14,45.45v65.23c0,24.69,11,35.15,25.66,35.15,16.35,0,26.82-10.79,26.82-35.15V45.45H229V109.7c0,33.84-17.83,47.74-41.7,47.74-22.56,0-39.56-12.92-39.56-47.09V45.45Z"
                transform="translate(0.21 0)"
              />
              <path
                d="M271.19,53.78V76.51h20.6V87.46h-20.6v42.68c0,9.81,2.78,15.37,10.79,15.37a31.54,31.54,0,0,0,8.34-1l.65,10.8a35.31,35.31,0,0,1-12.75,2c-6.71,0-12.1-2.13-15.54-6.05-4.08-4.25-5.56-11.28-5.56-20.6V87.46H244.86V76.51h12.26v-19Z"
                transform="translate(0.21 0)"
              />
              <path
                d="M351.79,155.64l-1.15-10h-.49c-4.41,6.21-12.91,11.77-24.19,11.77-16,0-24.2-11.28-24.2-22.73,0-19.12,17-29.59,47.58-29.42v-1.64c0-6.54-1.8-18.31-18-18.31a39.51,39.51,0,0,0-20.6,5.88l-3.27-9.48c6.54-4.25,16-7,26-7,24.2,0,30.08,16.51,30.08,32.37v29.6a111.45,111.45,0,0,0,1.31,19Zm-2.13-40.38c-15.69-.33-33.51,2.45-33.51,17.82,0,9.32,6.21,13.73,13.57,13.73a19.69,19.69,0,0,0,19.13-13.24,15,15,0,0,0,.81-4.58Z"
                transform="translate(0.21 0)"
              />
              <path
                d="M386.78,39.56h14.39V88.94h.32a26.71,26.71,0,0,1,10.3-10.14,29.64,29.64,0,0,1,14.72-4.09c10.63,0,27.63,6.54,27.63,33.84v47.09H439.75V110.19c0-12.75-4.74-23.54-18.31-23.54-9.32,0-16.68,6.54-19.29,14.38a17.41,17.41,0,0,0-1,6.87v47.74H386.78Z"
                transform="translate(0.21 0)"
              />
            </g>
            <g>
              <path
                d="M502.32,140.81c-8.41,11-18.77,16.24-23.91,16.24-4.39,0-6.36-4.3-3.39-16.87,2.66-11,7-27.61,10-40.22.73-3.35.56-4.79-.49-4.79-1.6,0-6.22,3-10.29,6.88l-2.15-4.35c8.14-8.6,19.16-15.23,24.45-15.23,4.27,0,4.64,5.38,1.63,17.83-2.94,11.28-6.74,27.08-9.55,38.24-1.12,4.28-1.12,6.13,0,6.13,1.55,0,5.83-2.25,11.37-8.08Zm4.18-83.54c0,5.25-3.76,9.91-9.12,9.91a7.31,7.31,0,0,1-7.57-7.73c0-4.41,3.42-10,9.64-10C504.14,49.45,506.5,53,506.5,57.27Z"
                transform="translate(0.21 0)"
              />
              <path
                d="M588.6,140.7c-8.26,10.78-18.5,16.48-23.26,16.48-5,0-7.19-4-3.94-19.33l1.78-8.4c-9.21,13.38-24.29,27.73-35.61,27.73-6.59,0-12.34-6-12.34-20.68s6.65-32.08,18.7-42.25C541,88,554,82.61,561.64,82.61c3.26,0,7.91.39,10.92,1.88l5.37-26.26c1.29-6.66.07-7.3-5.9-7.81-1.58-.16-4.78-.33-5.82-.33l1-4.51a121.14,121.14,0,0,0,21.2-4.24,29.06,29.06,0,0,1,4.89-1.15c1.43,0,1.72,1.5.92,4.88-7.25,31.12-15,65.89-20.13,93.63-.8,4.28-.24,6.11.91,6.11,1.9,0,5.92-2.47,11.53-8.44Zm-28.72-15.17a43.62,43.62,0,0,0,7.35-16.9l3.21-13.88c-2.39-2.72-7.68-4.93-14.94-4.93-17.73,0-25.4,26.09-25.4,43.11,0,8.51,2.29,12.89,6.37,12.89C542.89,145.82,552.08,136.93,559.88,125.53Z"
                transform="translate(0.21 0)"
              />
            </g>
          </g>
        </g>
      </svg>
    </Button>
  );
};
LogInButton.propTypes = {
  className: PropTypes.string,
};

export const LogOutButton = () => {
  const { logout } = useFirebaseAuth();

  const handleClick = () => {
    logout();
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
  'h-8 border-sky-600 bg-sky-500 text-white hover:border-sky-700 hover:bg-sky-600 focus:border-sky-500 focus:ring-sky-600/50 active:bg-sky-700';
const secondaryClasses =
  'h-8 border-yellow-500 bg-yellow-400 text-black hover:border-yellow-600 hover:bg-yellow-500 focus:border-yellow-400 focus:ring-yellow-500/50 active:bg-yellow-600';
const alternateClasses =
  'h-8 border-slate-400 bg-slate-100 text-slate-900 hover:text-white hover:border-slate-500 hover:bg-slate-400 focus:border-slate-500 focus:ring-slate-500/50 active:bg-slate-600 active:text-white';
const linkClasses =
  'text-amber-900 italic font-medium active:text-amber-500 focus:outline-hidden underline underline-offset-2 hover:underline-offset-4 decoration-amber-500 active:underline-offset-8 active:decoration-amber-600 hover:decoration-2 transition-all';

const noButtonGroup = 'rounded-full';
const buttonGroupLeft = 'border-r-0 rounded-l-full';
const buttonGroupRight = 'border-l-0 rounded-r-full';
const buttonGroupMiddle = 'border-x-0';

const buttonClasses = (style, buttonGroup) => {
  return clsx(
    style !== 'link' &&
      'flex min-h-[2rem] w-fit cursor-pointer items-center justify-center border-2 px-7 py-1 transition-all duration-200 ease-in-out focus:ring-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
    style === 'primary' && primaryClasses,
    style === 'secondary' && secondaryClasses,
    style === 'alternate' && alternateClasses,
    style === 'link' && linkClasses,
    !buttonGroup && noButtonGroup,
    buttonGroup?.left && buttonGroupLeft,
    buttonGroup?.middle && buttonGroupMiddle,
    buttonGroup?.right && buttonGroupRight,
  );
};
export const Button = ({
  children,
  name,
  type = 'button',
  style = 'primary',
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
      disabled={['disabled', 'pending', 'error'].includes(state)}
      onClick={onClick}
      className={buttonClasses(style, buttonGroup)}
    >
      {state === 'pending' && (
        <svg
          className="mr-2 -ml-1 h-5 w-5 animate-spin motion-reduce:hidden"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {state === 'error' && <ExclamationCircleIcon className="mr-2 -ml-1 h-5 w-5 text-red-500" />}
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
  children: PropTypes.node.isRequired,
  /**
   * The style of button
   */
  style: PropTypes.oneOf(['primary', 'secondary', 'alternate', 'link']),
  /**
   * The state of button
   */
  state: PropTypes.oneOf(['idle', 'disabled', 'pending', 'success', 'error']),
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

export const Link = ({ href, children, target, rel, buttonGroup, style = 'link' }) => {
  const attributes = {
    target,
    rel,
    href,
    className: buttonClasses(style, buttonGroup),
  };

  return <a {...attributes}>{children}</a>;
};
Link.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string,
  target: PropTypes.string,
  rel: PropTypes.string,
  /**
   * The style of button
   */
  style: PropTypes.oneOf(['primary', 'secondary', 'alternate', 'link']),
  buttonGroup: PropTypes.object,
};
