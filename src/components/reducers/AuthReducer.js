const AuthReducer = (_, action) => {
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

export default AuthReducer;
