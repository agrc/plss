import { useUser } from 'reactfire';
import PropTypes from 'prop-types';
import { LogInButton, LogOutButton, Button } from '../formElements/Buttons.jsx';
import Card from '../formElements/Card.jsx';

export default function Login({ dispatch }) {
  const { data: user } = useUser();

  return (
    <Card>
      {user !== null ? (
        <div className="flex w-full flex-col items-center gap-6">
          <h2 className="text-3xl font-semibold lg:text-2xl">
            Welcome back, {user.displayName}
          </h2>
          <img
            className="h-40 w-40 max-w-xs self-center rounded-full border-2 border-sky-900 bg-sky-800 text-sm shadow-lg"
            src="https://source.unsplash.com/random/256x256?face"
            alt="profile"
          />
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
