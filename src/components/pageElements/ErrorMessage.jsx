/**
 * @typedef {Object} ErrorMessageTagProps
 * @property {string} [children]
 */

/**
 * @type {React.FC<ErrorMessageTagProps>}
 */
export default function ErrorMessageTag({ children }) {
  return (
    <p className="m-auto w-4/5 rounded-sm rounded-t-none bg-sky-700 px-2 py-1 text-center text-sm font-semibold text-white shadow-sm">
      {children}
    </p>
  );
}
