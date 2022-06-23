import PropTypes from 'prop-types';

export default function ErrorMessageTag({ children }) {
  return (
    <p className="m-auto w-3/4 rounded rounded-t-none bg-indigo-900 py-1 text-center font-semibold text-red-100 shadow">
      {children}
    </p>
  );
}

ErrorMessageTag.propTypes = {
  children: PropTypes.string,
};
