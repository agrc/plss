import PropTypes from 'prop-types';
import { useStorage } from 'reactfire';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { useQuery } from '@tanstack/react-query';
import {
  ExclamationCircleIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  ArrowDownOnSquareIcon,
  ArrowDownCircleIcon,
} from '@heroicons/react/20/solid';
import { Button } from '../formElements/Buttons.jsx';
import { getDefault } from '../helpers';
import Spacer from '../formElements/Spacer.jsx';

const managed_counties = {
  UTAH: 'https://maps.utahcounty.gov/TieSheets/TieSheet.htm',
  WASATCH:
    'https://wasatch.maps.arcgis.com/apps/webappviewer/index.html?id=103db0251a5342f7bbd1462eb7a47440',
  DAVIS: 'http://www.co.davis.ut.us/surveyor/default.cfm',
  'SALT LAKE': 'https://slco.org/surveyor/apps/surveymonument/map.html',
  WEBER: 'https://www3.co.weber.ut.us/gis/maps/survey/index.html',
  DUCHESNE: 'https://duchesne.utah.gov/surveyor/base&meridian.html',
  UINTAH: 'https://www.co.uintah.ut.us/surveyor/UCTieSheet.htm',
  CACHE: 'https://www.cachecounty.org/surveyor/find-a-survey.html',
};

export default function Identify({ authenticated, graphic, dispatch }) {
  if (!graphic) {
    return <EmptyIdentify dispatch={dispatch} />;
  }

  return (
    <>
      <h1 className="text-2xl font-bold">PLSS Point Information</h1>
      <h2 className="ml-2 mt-1 text-xl font-light">
        {graphic.attributes.point_id}
      </h2>

      <main className="inline-grid gap-5 text-sm">
        {graphic?.attributes?.point_id && (
          <TieSheetList blmPointId={graphic.attributes.point_id}>
            <SubmissionPicker
              dispatch={dispatch}
              authenticated={authenticated}
              blmPointId={graphic.attributes.point_id}
            />
          </TieSheetList>
        )}

        <section className="flex flex-col gap-2 rounded-lg bg-slate-50 py-2 px-6 text-sm text-slate-800 shadow-lg">
          <h3 className="mb-2 text-xl font-medium text-slate-800">Location</h3>
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
        </section>

        <section className="flex flex-col gap-2 rounded-lg bg-slate-50 py-2 px-6 text-sm text-slate-800 shadow-lg">
          <h3 className="mb-2 text-xl font-medium text-slate-800">
            Identification
          </h3>
          <section className="flex w-full justify-between">
            <span className="font-semibold">Corner Id</span>
            <span>{graphic.attributes.point_id}</span>
          </section>
          <section className="flex w-full justify-between">
            <span className="font-semibold">PLSS Id</span>
            <span>{graphic.attributes.plss_id}</span>
          </section>
          <section className="flex w-full justify-between">
            <span className="font-semibold">Point label</span>
            <span>{graphic.attributes.label}</span>
          </section>
        </section>

        <section className="flex flex-col gap-2 rounded-lg bg-slate-50 py-2 px-6 text-sm text-slate-800 shadow-lg">
          <h3 className="mb-2 text-xl font-medium text-slate-800">
            Categories
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <section className="flex flex-col items-center">
              <span className="font-semibold">Control point</span>
              {getDefault(graphic.attributes.control, 'No') === '1' ? (
                <CheckIcon className="h-8 w-8 text-green-500" />
              ) : (
                <XMarkIcon className="h-8 w-8 text-red-500" />
              )}
            </section>
            <section className="flex flex-col items-center">
              <span className="font-semibold">MRRC project</span>
              {getDefault(graphic.attributes.mrrc, 'No') === '1' ? (
                <CheckIcon className="h-8 w-8 text-green-500" />
              ) : (
                <XMarkIcon className="h-8 w-8 text-red-500" />
              )}
            </section>
            <section className="flex flex-col items-center">
              <span className="font-semibold">Has Monument</span>
              {getDefault(graphic.attributes.monument, 'No') === '1' ? (
                <CheckIcon className="h-8 w-8 text-green-500" />
              ) : (
                <XMarkIcon className="h-8 w-8 text-red-500" />
              )}
            </section>
            <section className="flex flex-col items-center">
              <span className="font-semibold">Category</span>
              <span className="mt-1">
                {getDefault(graphic.attributes.point_category)}
              </span>
            </section>
          </div>
        </section>

        <section className="flex flex-col gap-2 rounded-lg bg-slate-50 py-2 px-6 text-sm text-slate-800 shadow-lg">
          <h3 className="mb-2 text-xl font-medium text-slate-800">Stewards</h3>
          <section className="flex w-full justify-between">
            <span className="font-semibold">Primary</span>
            <span>{getDefault(graphic.attributes.steward)}</span>
          </section>
          <section className="flex w-full justify-between">
            <span className="font-semibold">Alternate</span>
            <span>{getDefault(graphic.attributes.steward_second)}</span>
          </section>
          {graphic.attributes.managed_by && (
            <section className="flex w-full justify-between">
              <span className="font-semibold">County managed</span>
              <span>
                <a
                  href={managed_counties[graphic.attributes.managed_by]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="under italic text-amber-500 underline visited:text-amber-600 hover:text-amber-700"
                >
                  {getDefault(graphic.attributes.managed_by)} county surveyor
                  website
                </a>
              </span>
            </section>
          )}
        </section>

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
  authenticated: PropTypes.bool,
};

const EmptyIdentify = ({ dispatch }) => {
  return (
    <>
      <h3 className="text-2xl font-semibold">Monument Record Lookup</h3>
      <main className="mt-6 inline-grid gap-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-800 shadow-xl">
        <div className="flex justify-center">
          <ExclamationCircleIcon className="h-14 w-14 text-indigo-600" />
        </div>
        <h4 className="text-xl ">
          No corner point was found at this location.
        </h4>
        <p className="">
          If you do not see any points, try zooming in and click on the point
          again. Otherwise try clicking on the corner point again.
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
EmptyIdentify.propTypes = {
  dispatch: PropTypes.func,
};

const SubmissionPicker = ({ authenticated, blmPointId, dispatch }) => {
  return (
    <div className="mb-4 rounded-b-lg px-6">
      {authenticated ? (
        <>
          <h3 className="flex items-center justify-center font-light uppercase">
            <ArrowDownCircleIcon className="mr-1 h-4 w-4 items-center text-indigo-400 motion-safe:animate-bounce" />
            <span className=" text-slate-700">Submit your tiesheet</span>
            <ArrowDownCircleIcon className="ml-1 h-4 w-4 items-center text-indigo-400 motion-safe:animate-bounce" />
          </h3>
          <Spacer />
          <div className="space-between flex w-full justify-around">
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
          </div>
        </>
      ) : (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              dispatch({ type: 'menu/toggle', payload: 'login' });
            }}
          >
            login to submit your tiesheets
          </Button>
        </div>
      )}
    </div>
  );
};
SubmissionPicker.propTypes = {
  authenticated: PropTypes.bool,
  dispatch: PropTypes.func,
  blmPointId: PropTypes.string.isRequired,
};

const TieSheetList = ({ blmPointId, children }) => {
  const storage = useStorage();

  const path = `tiesheets/${blmPointId}`;
  const fileRef = ref(storage, path);

  const { data, status } = useQuery(
    [blmPointId],
    async () => {
      const response = await listAll(fileRef);

      if ((response?.items?.length ?? 0) > 0) {
        const urls = await Promise.all(
          response.items.map(async (item) => {
            const url = await getDownloadURL(item);

            return {
              url,
              name: item.name,
            };
          })
        );

        return urls;
      }

      return [];
    },
    {
      enabled: blmPointId != null,
    }
  );

  return (
    <section className="mt-4 flex flex-col gap-1 rounded-lg bg-slate-50 text-sm text-slate-800 shadow-lg">
      <div className="px-6 py-2">
        <h3 className="mb-2 text-xl font-medium text-slate-800">
          Tiesheet Documents
        </h3>
        {status === 'loading' && <div>Loading...</div>}
        {status === 'error' && (
          <div>The tiesheets are currently not available</div>
        )}
        {status === 'success' && (data?.length ?? 0) === 0 && (
          <div>This point has no tiesheets</div>
        )}
        {status === 'success' && data.length > 0 && (
          <ul>
            {data.map((x) => (
              <li
                key={x.name}
                className="group hover:rounded hover:bg-slate-100"
              >
                <span className="inline-flex align-middle">
                  <ArrowDownOnSquareIcon className="mr-2 inline-block h-4 w-4 text-indigo-600 group-hover:text-indigo-800" />
                  <a href={x.url} target="_blank" rel="noopener noreferrer">
                    {x.name}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
};
TieSheetList.propTypes = {
  blmPointId: PropTypes.string.isRequired,
  children: PropTypes.node,
};
