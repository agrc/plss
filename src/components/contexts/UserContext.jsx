import { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';

const AuthReducer = (state, action) => {
  switch (action.type) {
    case 'SIGN_IN': {
      return {
        state: 'SIGNED_IN',
        currentUser: action.payload.user,
      };
    }
    case 'SIGN_OUT': {
      return {
        state: 'SIGNED_OUT',
      };
    }
  }
};

export const AuthContext = createContext({
  state: { state: 'UNKNOWN' },
  dispatch: () => {},
});

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, { state: 'UNKNOWN' });

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.object.isRequired,
};

const useAuthState = () => {
  const { state } = useContext(AuthContext);
  return {
    state,
  };
};

const useSignIn = () => {
  const { dispatch } = useContext(AuthContext);
  return {
    signIn: (user) => {
      dispatch({ type: 'SIGN_IN', payload: { user } });
    },
  };
};

const useSignOut = () => {
  const { dispatch } = useContext(AuthContext);
  return {
    signOut: () => {
      dispatch({ type: 'SIGN_OUT' });
    },
  };
};

export { useAuthState, useSignIn, useSignOut, AuthProvider };
