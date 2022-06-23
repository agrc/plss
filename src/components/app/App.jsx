import { Router } from '../router/Router.jsx';
import { setupFirebase } from '../../firebase/firebase';
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useSignIn, useSignOut } from '../contexts/UserContext.jsx';

export default function App() {
  const { signIn } = useSignIn();
  const { signOut } = useSignOut();

  useEffect(() => {
    setupFirebase();

    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        signIn(user);
      } else {
        signOut();
      }
    });
    // signIn and signOut are stable?
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <Router />;
}
