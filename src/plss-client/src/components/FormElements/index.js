export const Input = ({ name, defaultValue, placeholder, inputRef }) => (
  <input
    name={name}
    defaultValue={defaultValue}
    placeholder={placeholder}
    ref={inputRef}
    className="block w-full py-2 pl-3 pr-10 text-black placeholder-gray-400 transition duration-100 ease-in-out bg-white border border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50 sm:text-sm"
  />
);

export const Button = ({ name, type, inputRef, children, onClick }) => (
  <button
    type={type}
    name={name}
    ref={inputRef}
    onClick={onClick}
    className="block px-4 py-2 text-white transition duration-100 ease-in-out bg-blue-500 border border-transparent rounded shadow-sm hover:bg-blue-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50"
  >
    {children}
  </button>
);

export const Select = ({ name, placeholder, options, inputRef }) => {
  return (
    <select
      name={name}
      className="block w-full py-2 pl-3 pr-10 text-black placeholder-gray-400 transition duration-100 ease-in-out bg-white border border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-opacity-50 sm:text-sm"
      ref={inputRef}
    >
      {placeholder ? (
        <option disabled selected hidden className="placeholder-gray-400" value="">
          {placeholder}
        </option>
      ) : null}
      {options.map((option, index) => (
        <option value={option?.value ?? option} key={index}>
          {option?.label ?? option}
        </option>
      ))}
    </select>
  );
};
