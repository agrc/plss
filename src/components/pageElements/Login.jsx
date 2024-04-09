import PropTypes from 'prop-types';
import { httpsCallable } from 'firebase/functions';
import { useFunctions, useSigninCheck, useUser } from 'reactfire';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogInButton, LogOutButton, Button } from '../formElements/Buttons.jsx';
import Card from '../formElements/Card.jsx';
import md5 from 'md5';
import { useEffect } from 'react';
import usePageView from '../hooks/usePageView.jsx';

const size = 160;
const fallback = encodeURI('https://gis.utah.gov/images/plss_gcdb_lg.jpg');

export default function Login({ dispatch }) {
  const { data } = useSigninCheck();
  const queryClient = useQueryClient();
  const signedIn = data?.signedIn ?? '';

  useEffect(() => {
    if (!signedIn) {
      queryClient.removeQueries({
        queryKey: ['profile'],
        type: 'all',
      });
      queryClient.removeQueries({
        queryKey: ['my content'],
        type: 'all',
      });
    }
  }, [signedIn, queryClient]);
  return (
    <Card>{data?.signedIn ? <Profile dispatch={dispatch} /> : <SignIn />}</Card>
  );
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
        This app requires a UtahId account to submit monument record sheets.
        Your name and email address will be shared with this application.
      </p>
      <p>
        A surveyor license and seal will be displayed publicly on monument
        record sheets if you choose to add them on your profile. Otherwise, no
        other personal information will be shared or made public.
      </p>
      <div className="flex items-center text-slate-500">
        <span className="h-px flex-1 bg-slate-200"></span>
        <span className="mx-3 text-xs uppercase tracking-wide">
          continue with
        </span>
        <span className="h-px flex-1 bg-slate-200"></span>
      </div>
      <div className="flex justify-center">
        <LogInButton />
      </div>
    </div>
  );
};

const Profile = ({ dispatch }) => {
  const functions = useFunctions();
  const getProfile = httpsCallable(functions, 'getProfile');
  const { data: user } = useUser();
  usePageView('screen-main-profile');

  const { data: response, status } = useQuery({
    queryKey: ['profile', user.uid],
    enabled: user?.uid?.length > 0,
    queryFn: getProfile,
    placeholderData: {
      data: {
        displayName: user?.displayName ?? '',
        email: user?.email ?? '',
        license: '',
      },
    },
    staleTime: Infinity,
  });

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <h2 className="text-3xl font-semibold lg:text-2xl">
        Welcome back, {response.data.displayName}
      </h2>
      <span className="relative">
        <span className="mr-2 inline-block h-40 w-40 overflow-hidden rounded-full border-2 border-sky-500 bg-slate-100 shadow-lg">
          {status === 'success' && <Gravatar email={response.data.email} />}
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
          onClick={() => dispatch({ type: 'menu/toggle', payload: 'profile' })}
        >
          My Profile
        </Button>
      </div>
    </div>
  );
};
Profile.propTypes = {
  dispatch: PropTypes.func,
};

const Gravatar = ({ email }) => {
  const gravatar = `https://www.gravatar.com/avatar/${md5(
    email.toLowerCase()
  )}?s=${size}&default=${fallback}`;

  return <img src={gravatar} alt="Gravatar" />;
};
Gravatar.propTypes = {
  email: PropTypes.string.isRequired,
};
