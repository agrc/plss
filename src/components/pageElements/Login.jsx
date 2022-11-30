import { useUser } from 'reactfire';
import PropTypes from 'prop-types';
import { LogInButton, LogOutButton, Button } from '../formElements/Buttons.jsx';
import Card from '../formElements/Card.jsx';
import md5 from 'md5';

const size = 160;
const fallback = encodeURI('https://gis.utah.gov/images/plss_gcdb_lg.jpg');

export default function Login({ dispatch }) {
  const { data: user } = useUser();

  const email = user?.email ?? '';
  const gravatar = `https://www.gravatar.com/avatar/${md5(
    email.toLowerCase()
  )}?s=${size}&default=${fallback}`;

  return (
    <Card>
      {user !== null ? (
        <div className="flex w-full flex-col items-center gap-6">
          <h2 className="text-3xl font-semibold lg:text-2xl">
            Welcome back, {user.displayName}
          </h2>

          <span className="relative">
            <span className="mr-2 inline-block h-40 w-40 overflow-hidden rounded-full border-2 border-sky-500 bg-slate-100 shadow-lg">
              <img src={gravatar} alt="Gravatar" />
            </span>
            <svg
              className="absolute bottom-1 right-3 h-6 w-6 fill-current text-slate-800/20"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 27 27"
              role="presentation"
              aria-hidden="true"
            >
              <path d="M10.8 2.699v9.45a2.699 2.699 0 005.398 0V5.862a8.101 8.101 0 11-8.423 1.913 2.702 2.702 0 00-3.821-3.821A13.5 13.5 0 1013.499 0 2.699 2.699 0 0010.8 2.699z"></path>
            </svg>
          </span>
          <div className="flex w-full justify-around">
            <LogOutButton />
            <Button
              onClick={() =>
                dispatch({ type: 'menu/toggle', payload: 'profile' })
              }
            >
              My Profile
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-6">
          <h2 className="mb-6 text-3xl font-semibold lg:text-4xl">
            Log in with
          </h2>
          <LogInButton />
        </div>
      )}
    </Card>
  );
}
Login.propTypes = {
  dispatch: PropTypes.func,
};
