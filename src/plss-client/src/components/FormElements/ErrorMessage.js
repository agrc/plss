const ErrorMessageTag = ({ children }) => (
  <p className="w-3/4 py-1 m-auto font-semibold text-center text-red-100 bg-indigo-900 rounded rounded-t-none shadow">
    {children}
  </p>
);

export default ErrorMessageTag;
