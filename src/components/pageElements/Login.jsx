import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFirebaseAuth, useFirebaseFunctions } from '@ugrc/utah-design-system';
import { httpsCallable } from 'firebase/functions';
import md5 from 'md5';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Button, LogInButton, LogOutButton } from '../formElements/Buttons.jsx';
import Card from '../formElements/Card.jsx';
import usePageView from '../hooks/usePageView.jsx';

const size = 160;
const fallback = 'mp';

export default function Login({ dispatch }) {
  const { currentUser } = useFirebaseAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUser === undefined) {
      queryClient.removeQueries({
        queryKey: ['profile'],
        type: 'all',
      });
      queryClient.removeQueries({
        queryKey: ['my content'],
        type: 'all',
      });
    }
  }, [currentUser, queryClient]);
  return <Card>{currentUser ? <Profile dispatch={dispatch} /> : <SignIn />}</Card>;
}
Login.propTypes = {
  dispatch: PropTypes.func,
};

const SignIn = () => {
  usePageView('screen-sign-in');

  return (
    <div className="grid flex-1 gap-4">
      <h2 className="text-2xl font-bold">Sign in to your account</h2>
      <p>
        This app requires a UtahId account to submit monument record sheets. Your name and email address will be shared
        with this application.
      </p>
      <p>
        A surveyor license and seal will be displayed publicly on monument record sheets if you choose to add them on
        your profile. Otherwise, no other personal information will be shared or made public.
      </p>
      <div className="flex items-center text-slate-500">
        <span className="h-px flex-1 bg-slate-200"></span>
        <span className="mx-3 text-xs tracking-wide uppercase">continue with</span>
        <span className="h-px flex-1 bg-slate-200"></span>
      </div>
      <div className="flex justify-center">
        <LogInButton />
      </div>
    </div>
  );
};

const Profile = ({ dispatch }) => {
  const { functions } = useFirebaseFunctions();
  const getProfile = httpsCallable(functions, 'getProfile');
  const { currentUser } = useFirebaseAuth();
  usePageView('screen-main-profile');

  const { data: response, status } = useQuery({
    queryKey: ['profile', currentUser.uid],
    enabled: currentUser !== undefined,
    queryFn: getProfile,
    placeholderData: {
      data: {
        displayName: currentUser?.displayName ?? '',
        email: currentUser?.email ?? '',
        license: '',
      },
    },
    staleTime: Infinity,
  });

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <h2 className="text-3xl font-semibold lg:text-2xl">Welcome back, {response.data.displayName}</h2>
      <span className="relative">
        <span className="mr-2 inline-block h-40 w-40 overflow-hidden rounded-full border-2 border-sky-500 bg-slate-100 shadow-lg">
          {status === 'success' && <Gravatar email={response.data.email} />}
        </span>
        <svg
          className="absolute right-3 bottom-1 h-6 w-6 fill-current text-slate-800/20"
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
        <Button onClick={() => dispatch({ type: 'menu/toggle', payload: 'profile' })}>My Profile</Button>
      </div>
    </div>
  );
};
Profile.propTypes = {
  dispatch: PropTypes.func,
};

const Gravatar = ({ email }) => {
  const gravatar = `https://www.gravatar.com/avatar/${md5(email.toLowerCase())}?r=pg&size=${size}&default=${fallback}`;

  return <img src={gravatar} alt="Gravatar" />;
};
Gravatar.propTypes = {
  email: PropTypes.string.isRequired,
};
