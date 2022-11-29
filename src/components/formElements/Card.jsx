import PropTypes from 'prop-types';

export default function Card({ children }) {
  return (
    <section className="inline-grid w-full gap-2 rounded-lg border border-slate-400 bg-white p-4 text-sm shadow-md">
      {children}
    </section>
  );
}
Card.propTypes = {
  children: PropTypes.node,
};
