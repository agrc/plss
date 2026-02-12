/**
 * @typedef {Object} NoteProps
 * @property {React.ReactNode} children
 */

/**
 * @type {React.FC<NoteProps>}
 */
export default function Note({ children }) {
  return <p className="border bg-slate-50 p-3 text-xs leading-tight text-balance">{children}</p>;
}
