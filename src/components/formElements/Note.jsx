import PropTypes from 'prop-types';

export default function Note({ children }) {
  return (
    <p className="border bg-slate-50 p-3 text-justify text-xs leading-tight">
      {children}
    </p>
  );
}
Note.propTypes = {
  children: PropTypes.node.isRequired,
};
