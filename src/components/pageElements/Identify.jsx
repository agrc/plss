import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Button } from '../formElements/Buttons.jsx';
import { useAuthState } from '../contexts/AuthContext.jsx';
import { getDefault } from '../helpers';

export default function Identify({ graphic }) {
  const navigate = useNavigate();
  const { state: userState } = useAuthState();

  if (graphic === undefined) {
    return <InitialIdentify />;
  }

  if (graphic === null) {
    return <EmptyIdentify />;
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Monument Record</h1>
      <main className="mt-3 inline-grid gap-1 text-sm">
        <section className="flex w-full">
          <span className="mr-2">{graphic.attributes.XCOORD}</span>
          <span>{graphic.attributes.YCOORD}</span>
        </section>

        <section className="flex w-full">
          <span className="mr-2 font-bold">Elevation</span>
          <span>{getDefault(graphic.attributes.ELEV, 'unknown', ' ft')}</span>
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
            <span>{graphic.attributes.POINTID}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">PLSS Id</span>
            <span>{graphic.attributes.PLSSID}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Point Label</span>
            <span>{graphic.attributes.POINTLAB}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Error North</span>
            <span>{getDefault(graphic.attributes.ERRORY)}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Error East</span>
            <span>{getDefault(graphic.attributes.ERRORX)}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Is Control</span>
            <span>{getDefault(graphic.attributes.isControl)}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Is Monument</span>
            <span>{getDefault(graphic.attributes.isMonument)}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Category</span>
            <span>{getDefault(graphic.attributes.Point_Category)}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">County</span>
            <span>{getDefault(graphic.attributes.COUNTY)}</span>
          </div>
        </section>

        <div className="mt-6 flex justify-center gap-2">
          <Button
            style="alternate"
            onClick={() => {
              navigate(-1);
            }}
          >
            close
          </Button>
          {userState.state === 'SIGNED_IN' ? (
            <Button
              onClick={() => {
                navigate(`/submission/${graphic.attributes.POINTID}`);
              }}
            >
              submit monument
            </Button>
          ) : (
            <Button
              onClick={() => {
                navigate(`/login`);
              }}
            >
              login to submit monument
            </Button>
          )}
        </div>
      </main>
    </>
  );
}

Identify.propTypes = {
  graphic: PropTypes.object,
};

const InitialIdentify = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1 className="text-2xl font-bold">Monument Record</h1>
      <main className="mt-3 inline-grid gap-1 text-sm">
        <p className="text-white">
          Click on the map to view monument information
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            style="alternate"
            onClick={() => {
              navigate('/');
            }}
          >
            close
          </Button>
        </div>
      </main>
    </>
  );
};

const EmptyIdentify = () => {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-2xl font-bold">Monument Record</h1>
      <main className="mt-3 inline-grid gap-1 text-sm">
        <p className="text-white">No PLSS Points found at this location</p>
        <div className="mt-6 flex justify-center">
          <Button
            style="alternate"
            onClick={() => {
              navigate(-1);
            }}
          >
            close
          </Button>
        </div>
      </main>
    </>
  );
};
