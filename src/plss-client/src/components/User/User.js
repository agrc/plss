import * as React from 'react';

export default function User() {
  return (
    <div className="">
      <div className="grid mx-2 place-items-center sm:my-auto">
        <div className="w-full px-6 bg-white rounded-lg shadow-md sm:px-10 sm:py-6 lg:shadow-lg">
          <h2 className="text-3xl font-semibold text-center text-gray-800 lg:text-4xl">Login</h2>

          <form className="mt-10" method="POST">
            <label htmlFor="email" className="block text-xs font-semibold text-gray-600 uppercase">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="e-mail address"
              autocomplete="email"
              className="block w-full px-1 py-3 mt-2 text-gray-800 border-b-2 border-gray-100 appearance-none focus:text-gray-500 focus:outline-none focus:border-gray-200"
              required
            />

            <label htmlFor="password" className="block mt-2 text-xs font-semibold text-gray-600 uppercase">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="password"
              autocomplete="current-password"
              className="block w-full px-1 py-3 mt-2 mb-4 text-gray-800 border-b-2 border-gray-100 appearance-none focus:text-gray-500 focus:outline-none focus:border-gray-200"
              required
            />

            <button
              type="submit"
              className="w-full py-3 mt-10 font-medium text-white uppercase bg-gray-800 rounded-sm focus:outline-none hover:bg-gray-700 hover:shadow-none"
            >
              Login
            </button>

            <div className="flex flex-col mt-8 text-sm text-center text-black sm:mb-4">
              <a href="forgot-password" className="underline flex-2">
                Forgot password?
              </a>

              <p className="flex-1 mx-4 my-1 text-gray-500 text-md sm:my-auto">or</p>

              <a href="register" className="underline flex-2">
                Create an Account
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
