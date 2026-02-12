/**
 * @typedef {Object} NumberedFormProps
 * @property {React.ReactNode} children
 * @property {function} [onSubmit]
 */

/**
 * @type {React.FC<NumberedFormProps>}
 */
export function NumberedForm({ children, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="mb-10 flex w-full flex-col items-center justify-center">
      <div className="relative flex w-full flex-col gap-4 pl-6 after:absolute after:h-full after:border-l-2 after:border-sky-100 after:content-['']">
        {children}
      </div>
    </form>
  );
}

/**
 * @typedef {Object} NumberedFormSectionProps
 * @property {React.ReactNode} children
 * @property {number} number
 * @property {string} [title]
 */

/**
 * @type {React.FC<NumberedFormSectionProps>}
 */
export function NumberedFormSection({ children, number, title }) {
  return (
    <>
      <div className="relative flex items-center font-semibold">
        <div className="absolute top-1/2 left-0 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-sky-100 bg-white text-sky-500">
          {number > 0 ? number : '👍'}
        </div>
        <div className="ml-8 flex-1 uppercase">{title ? title : children}</div>
      </div>
      {title && <div className="mb-4 ml-8 flex flex-col gap-4">{children}</div>}
    </>
  );
}
