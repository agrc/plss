import PropTypes from 'prop-types';

export default function Note({ children }) {
  return <p className="border bg-slate-50 p-3 text-xs leading-tight text-balance">{children}</p>;
}
Note.propTypes = {
  children: PropTypes.node.isRequired,
};
