import PropTypes from 'prop-types';
import { useSigninCheck } from 'reactfire';
import { Button } from '../formElements/Buttons.jsx';
import { getDefault } from '../helpers';

export default function Identify({ graphic, dispatch }) {
  const { data: userSignInCheck } = useSigninCheck();

  if (graphic === null) {
    return <EmptyIdentify dispatch={dispatch} />;
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Monument Record</h1>
      <main className="mt-3 inline-grid gap-1 text-sm">
        <section className="flex w-full">
          <span className="mr-2">{graphic.attributes.latitude}</span>
          <span>{graphic.attributes.longitude}</span>
        </section>

        <section className="flex w-full">
          <span className="mr-2 font-bold">Elevation</span>
          <span>
            {getDefault(graphic.attributes.elevation, 'unknown', ' ft')}
          </span>
        </section>

        <section className="mt-4">
          <button className="font-semibold text-indigo-300 hover:text-indigo-400">
            Tie Sheet Document(s)
          </button>
        </section>

        <span className="my-2 inline-block h-1 w-full rounded bg-indigo-400 sm:my-6"></span>

        <section className="flex w-full flex-col sm:gap-3">
          <div className="flex w-2/3 justify-between border-b border-slate-500 pb-1 sm:w-full">
            <span className="font-semibold">Corner id</span>
            <span>{graphic.attributes.point_id}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">PLSS id</span>
            <span>{graphic.attributes.plss_id}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Point label</span>
            <span>{graphic.attributes.label}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Steward</span>
            <span>{getDefault(graphic.attributes.steward)}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Managed by</span>
            <span>{getDefault(graphic.attributes.managed_by)}</span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Control point</span>
            <span>
              {getDefault(graphic.attributes.control, 'No') === '1'
                ? 'Yes'
                : 'No'}
            </span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">MRRC project</span>
            <span>
              {getDefault(graphic.attributes.mrrc, 'No') === '1' ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Has Monument</span>
            <span>
              {getDefault(graphic.attributes.monument, 'No') === '1'
                ? 'Yes'
                : 'No'}
            </span>
          </div>
          <div className="flex w-2/3 justify-between border-b border-slate-500 py-1 sm:w-full">
            <span className="font-semibold">Category</span>
            <span>{getDefault(graphic.attributes.point_category)}</span>
          </div>
        </section>

        <div className="mt-6 justify-self-center">
          <SubmissionPicker
            dispatch={dispatch}
            authenticated={userSignInCheck?.signedIn}
            blmPointId={graphic.attributes.point_id}
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
