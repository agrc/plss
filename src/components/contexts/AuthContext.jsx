import { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';
import AuthReducer from '../reducers/AuthReducer';

export const AuthContext = createContext({
  state: { state: 'UNKNOWN' },
  dispatch: () => {},
});
const Provider = AuthContext.Provider;

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, { state: 'UNKNOWN' });

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.array.isRequired,
};

export const useAuthState = () => {
  const { state } = useContext(AuthContext);
  return {
    state,
  };
};

export const useSignIn = () => {
  const { dispatch } = useContext(AuthContext);
  return {
    signIn: (user) => {
      dispatch({ type: 'SIGN_IN', payload: { user } });
    },
  };
};

export const useSignOut = () => {
  const { dispatch } = useContext(AuthContext);
  return {
    signOut: () => {
      dispatch({ type: 'SIGN_OUT' });
    },
  };
};
