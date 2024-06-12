import PropTypes from 'prop-types';

function Spacer({ className = 'my-2' }) {
  return <div className={className}></div>;
}

export default Spacer;

Spacer.propTypes = {
  className: PropTypes.string,
};
