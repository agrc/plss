/**
 * @typedef {Object} SpacerProps
 * @property {string} [className]
 */

/**
 * @type {React.FC<SpacerProps>}
 */
function Spacer({ className = 'my-2' }) {
  return <div className={className}></div>;
}

export default Spacer;
