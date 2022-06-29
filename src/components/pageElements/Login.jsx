import { useAuthState } from '../contexts/AuthContext.jsx';
import { LogInButton, LogOutButton } from '../formElements/Buttons.jsx';

export default function Login() {
  const { state: userState } = useAuthState();

  return (
    <div className="mx-2 my-auto grid md:my-6">
      <div className="align-center flex flex-col rounded-lg bg-white px-2 pb-10 shadow-md sm:py-6 md:px-10 lg:shadow-lg">
        {userState.state == 'SIGNED_IN' ? (
          <div className="flex w-full flex-col justify-center">
            <h2 className="mb-6 text-3xl font-semibold text-slate-800 lg:text-2xl">
              Welcome back, {userState.currentUser.displayName}
            </h2>
            <img
              className="my-6 h-24 w-24 max-w-xs self-center rounded-full border-2 border-slate-700 bg-slate-800 text-sm"
              src="https://source.unsplash.com/random/256x256?face"
              alt="profile"
            />
            <LogOutButton />
          </div>
        ) : (
          <>
            <h2 className="mb-6 text-3xl font-semibold text-slate-800 lg:text-4xl">
              Log in with
            </h2>
            <LogInButton />
          </>
        )}
      </div>
    </div>
  );
}
