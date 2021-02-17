import * as React from 'react';

export default function User({ authenticated, dispatch }) {
  return (
    <div className="grid mx-2 sm:my-auto">
      <div className="w-full px-6 pb-10 bg-white rounded-lg shadow-md sm:px-10 sm:py-6 lg:shadow-lg">
        {authenticated ? (
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold text-center text-gray-800 lg:text-4xl">Welcome back!</h2>
            <button
              className="flex self-center max-w-xs text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              id="user-menu"
              aria-haspopup="true"
            >
              <img
                className="w-8 h-8 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold text-center text-gray-800 lg:text-4xl">Login</h2>
            <button
              type="submit"
              className="w-full py-3 mt-10 font-medium text-white uppercase bg-gray-800 rounded-sm focus:outline-none hover:bg-gray-700 hover:shadow-none"
              onClick={() => {
                dispatch({ type: 'user/login' });
              }}
            >
              Login with UtahID
            </button>
          </>
        )}
      </div>
    </div>
  );
}
