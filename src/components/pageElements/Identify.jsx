import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const getDefault = (value, nullReplacement = '-') => {
  value = value?.toString().toLowerCase().trim();

  if (!value) {
    return nullReplacement;
  }

  const nulls = ['null', '<null>', ''];

  if (nulls.includes(value)) {
    return nullReplacement;
  }

  return value;
};

export default function Identify({ graphic }) {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-2xl font-bold">Monument Record</h1>
      <main className="mt-3 inline-grid gap-1 text-sm">
        <section className="flex w-full">
          <span className="mr-2">
            {graphic.attributes['X or East Coordinate']}
          </span>
          <span>{graphic.attributes['Y or North Coordinate']}</span>
        </section>

        <section className="flex w-full">
          <span className="mr-2 font-bold">Elevation</span>
          <span>
            {getDefault(graphic.attributes['Average Township Elevation'])} ft
          </span>
        </section>

        <section className="mt-4">
          <a
            href="/404"
            className="font-semibold text-indigo-300 hover:text-indigo-400"
          >
            Tie Sheet Document(s)
          </a>
        </section>

        <span className="my-2 inline-block h-1 w-full rounded bg-indigo-400 sm:my-6"></span>

        <section className="flex w-full flex-col sm:gap-3">
          <div className="flex w-2/3 justify-between border-b border-slate-500 pb-1 sm:w-full">
            <span className="font-semibold">Corner Id</span>
            <span>{graphic.attributes['Corner Point Identifier']}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">PLSS Id</span>
            <span>{graphic.attributes['PLSS Area Identification']}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Point Label</span>
            <span>{graphic.attributes['Corner Point Label']}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Error North</span>
            <span>{getDefault(graphic.attributes['Error in Y'])}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Error East</span>
            <span>{getDefault(graphic.attributes['Error in X'])}</span>
          </div>
        </section>

        <button
          className="ripple mx-auto mt-6 w-min rounded border-2 bg-transparent px-6 py-2 font-medium uppercase transition hover:bg-indigo-200 hover:text-black focus:outline-none"
          onClick={() => {
            console.log(navigate(-1));
          }}
        >
          close
        </button>
      </main>
    </>
  );
}
Identify.propTypes = {
  graphic: PropTypes.object,
};
