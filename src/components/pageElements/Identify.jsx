import PropTypes from 'prop-types';
import { useSigninCheck } from 'reactfire';
import { Button } from '../formElements/Buttons.jsx';
import { getDefault } from '../helpers';

export default function Identify({ graphic, dispatch }) {
  const { data: userSignInCheck } = useSigninCheck();

  if (graphic === undefined) {
    return <InitialIdentify dispatch={dispatch} />;
  }

  if (graphic === null) {
    return <EmptyIdentify dispatch={dispatch} />;
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
        </section>

        <div className="mt-6 justify-self-center">
          <SubmissionPicker
            dispatch={dispatch}
            authenticated={userSignInCheck?.signedIn}
            blmPointId={graphic.attributes.POINTID}
          />
        </div>
        <div className="mt-6 justify-self-center">
          <Button
            style="alternate"
            onClick={() => {
              dispatch({ type: 'menu/toggle', payload: '' });
            }}
          >
            close
          </Button>
        </div>
      </main>
    </>
  );
}

Identify.propTypes = {
  graphic: PropTypes.object,
  dispatch: PropTypes.func,
};

const InitialIdentify = ({ dispatch }) => {
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
              dispatch({ type: 'menu/toggle', payload: '' });
            }}
          >
            close
          </Button>
        </div>
      </main>
    </>
  );
};
InitialIdentify.propTypes = {
  dispatch: PropTypes.func,
};

const EmptyIdentify = ({ dispatch }) => {
  return (
    <>
      <h1 className="text-2xl font-bold">Monument Record</h1>
      <main className="mt-3 inline-grid gap-1 text-sm">
        <p className="text-white">No PLSS Points found at this location</p>
        <div className="mt-6 flex justify-center">
          <Button
            style="alternate"
            onClick={() => {
              dispatch({ type: 'menu/toggle', payload: '' });
            }}
          >
            close
          </Button>
        </div>
      </main>
    </>
  );
};
EmptyIdentify.propTypes = {
  dispatch: PropTypes.func,
};

const SubmissionPicker = ({ authenticated, blmPointId, dispatch }) => {
  return (
    <div className="rounded border bg-slate-100 p-4">
      <p className="font-bold text-slate-800">
        Submit a monument record for this point.
      </p>
      <span className="my-2 inline-block h-0.5 w-full rounded bg-slate-400 sm:my-6"></span>

      <div className="space-between flex w-full justify-around">
        {authenticated ? (
          <>
            <Button
              onClick={() => {
                dispatch({
                  type: 'menu/toggle',
                  payload: 'submission',
                  meta: { blmPointId, type: 'new' },
                });
              }}
            >
              new sheet
            </Button>
            <Button
              onClick={() => {
                dispatch({
                  type: 'menu/toggle',
                  payload: 'submission',
                  meta: { blmPointId, type: 'existing' },
                });
              }}
            >
              existing sheet
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              dispatch({ type: 'menu/toggle', payload: 'login' });
            }}
          >
            login
          </Button>
        )}
      </div>
    </div>
  );
};
SubmissionPicker.propTypes = {
  authenticated: PropTypes.bool,
  dispatch: PropTypes.func,
  blmPointId: PropTypes.string.isRequired,
};
