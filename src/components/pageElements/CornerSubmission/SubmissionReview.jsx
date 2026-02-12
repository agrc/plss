import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFirebaseFunctions, useFirebaseStorage } from '@ugrc/utah-design-system';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref } from 'firebase/storage';
import { useContext, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
  geographic as geographicOptions,
  grid as gridOptions,
} from '../../../../functions/shared/cornerSubmission/Options.js';
import { formatDatum, keyMap } from '../../../../functions/shared/index.js';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import { Link } from '../../formElements/Buttons.jsx';
import Card from '../../formElements/Card.jsx';
import { ObjectPreview } from '../../formElements/FileUpload.jsx';
import usePageView from '../../hooks/usePageView.jsx';
import Wizard from './Wizard.jsx';

const Review = () => {
  const [state, send] = useContext(SubmissionContext);

  usePageView('screen-submission-review');

  const { functions } = useFirebaseFunctions();
  const saveCorner = httpsCallable(functions, 'postCorner');
  const generatePreview = httpsCallable(functions, 'postGeneratePreview');
  const queryClient = useQueryClient();

  const { data, status } = useQuery({
    enabled: state.context.type === 'new',
    queryKey: ['monument record sheet', state.context.blmPointId, { preview: true }, state.context],
    queryFn: () => generatePreview(state.context),
    staleTime: 5000, // 5 seconds,
  });
  const { mutate, status: mutationStatus } = useMutation({
    mutationKey: ['submit corner', state.context.blmPointId],
    mutationFn: (data) => saveCorner(data),
    onSuccess: async (response) => {
      console.log('success', response);
      await queryClient.cancelQueries();

      queryClient.invalidateQueries({ queryKey: ['my content'] });
      queryClient.removeQueries({ queryKey: ['monument record sheet'] });

      send({ type: 'NEXT' });
      state.context = undefined;
    },
    onError: (error) => {
      console.warn('error', error);
      send({ type: 'NEXT' });
    },
  });

  return (
    <>
      <div className="grid gap-2">
        <div className="mb-1 flex flex-col text-center">
          <h2 className="text-2xl font-bold uppercase">Corner Submission Review</h2>
          <h3 className="ml-2 text-xl font-light">{state.context.blmPointId}</h3>
        </div>
        {state.context.type !== 'existing' && <MetadataReview {...state.context.metadata} />}
        <CoordinateReview datum={state.context.datum} grid={state.context.grid} geographic={state.context.geographic} />
        {state.context.type === 'existing' && state.context.existing.mrrc && (
          <div className="relative">
            <div className="absolute top-0 right-0 rounded-sm border border-sky-800 bg-sky-300 px-2 text-sm text-sky-800 uppercase shadow-sm">
              MRRC
            </div>
          </div>
        )}
        {state.context.type === 'existing' ? (
          <AttachmentReview path={state.context.existing.pdf} />
        ) : (
          <ImagesReview images={state.context.images} />
        )}
        {state.context.type === 'new' && (
          <MonumentPreview status={status}>
            <PdfPreview path={data?.data} />
          </MonumentPreview>
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <Wizard back={() => send({ type: 'BACK' })} status={mutationStatus} finish={() => mutate(state.context)} />
      </div>
    </>
  );
};

const MetadataReview = ({ accuracy, collected, corner, description, mrrc, notes, section, status }) => {
  return (
    <Card>
      <h4 className="relative -mt-2 text-lg font-bold">
        Metadata
        {mrrc && (
          <div className="absolute top-0 right-0 rounded-sm border border-sky-800 bg-sky-300 px-2 text-sm text-sky-800 uppercase shadow-sm">
            MRRC
          </div>
        )}
      </h4>
      <div className="flex justify-between">
        <span className="font-semibold">Monument Status</span>
        <span className="ml-4">{keyMap.status(status)}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold">Collected on</span>
        <span className="ml-4">{collected}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold">Accuracy</span>
        <span className="ml-4">{keyMap.accuracy(accuracy)}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold">Section</span>
        <span className="ml-4">{`${corner} corner of section ${section}`}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">Monument Description</span>
        <span className="ml-4">{description}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">General Notes</span>
        <span className="ml-4">{notes}</span>
      </div>
    </Card>
  );
};

/**
 * @typedef {Object} MetadataReviewProps
 * @property {string} [status]
 * @property {string} [notes]
 * @property {string} [description]
 * @property {string} [accuracy]
 * @property {string} [collected]
 * @property {number} [section]
 * @property {string} [corner]
 * @property {boolean} [mrrc]
 */

const CoordinateReview = ({ datum, grid, geographic }) => {
  if (!datum) {
    return (
      <Card>
        <h4 className="-mt-2 text-lg font-bold">Primary Coordinates</h4>
        <div>No coordinates were specified with this submission</div>
      </Card>
    );
  }

  let calculated = geographicOptions[0].label;
  const [type] = datum.split('-');

  if (type === 'geographic') {
    calculated = gridOptions[0].label;
  }

  const coordinates = [];
  if (type === 'grid') {
    coordinates[0] = <GridCoordinateReview grid={grid} />;
    coordinates[1] = <GeographicCoordinateReview geographic={geographic} />;
  } else {
    coordinates[0] = <GeographicCoordinateReview geographic={geographic} />;
    coordinates[1] = <GridCoordinateReview grid={grid} />;
  }

  return (
    <>
      <Card>
        <h4 className="-mt-2 text-lg font-bold">Primary Coordinates</h4>
        <div className="flex justify-between">
          <span className="font-semibold">Datum</span>
          <span>{formatDatum(datum)}</span>
        </div>
        {coordinates[0]}
        <h4 className="py-2 text-lg font-bold text-slate-400">Calculated Coordinates</h4>
        <div className="flex justify-between">
          <span className="font-semibold">Datum</span>
          <span>{calculated}</span>
        </div>
        {coordinates[1]}
      </Card>
    </>
  );
};

/**
 * @typedef {Object} CoordinateReviewProps
 * @property {string} [datum]
 * @property {Object} [grid]
 * @property {string} [grid.zone]
 * @property {number} [grid.northing]
 * @property {number} [grid.easting]
 * @property {number} [grid.elevation]
 * @property {string} [grid.unit]
 * @property {Object} [geographic]
 * @property {Object} [geographic.northing]
 * @property {number} [geographic.northing.degrees]
 * @property {number} [geographic.northing.minutes]
 * @property {number} [geographic.northing.seconds]
 * @property {Object} [geographic.easting]
 * @property {number} [geographic.easting.degrees]
 * @property {number} [geographic.easting.minutes]
 * @property {number} [geographic.easting.seconds]
 * @property {number} [geographic.elevation]
 * @property {string} [geographic.unit]
 */

const GridCoordinateReview = ({ grid }) => (
  <>
    <div className="flex justify-between">
      <span className="font-semibold">Zone</span>
      <span>{keyMap.zone(grid?.zone)}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-semibold">Unit</span>
      <span>{keyMap.unit(grid?.unit)}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-semibold">Coordinates</span>
      <span>{`${grid?.northing}, ${grid?.easting}`}</span>
    </div>
    {grid?.elevation && (
      <div className="flex justify-between">
        <span className="font-semibold">{grid?.verticalDatum} Elevation</span>
        <span>{grid?.elevation}</span>
      </div>
    )}
  </>
);

/**
 * @typedef {Object} GridCoordinateReviewProps
 * @property {Object} [grid]
 * @property {string} [grid.zone]
 * @property {number} [grid.northing]
 * @property {number} [grid.easting]
 * @property {number} [grid.elevation]
 * @property {string} [grid.unit]
 * @property {string} [grid.verticalDatum]
 */

const GeographicCoordinateReview = ({ geographic }) => (
  <>
    <div className="flex justify-between">
      <span className="font-semibold">Coordinates</span>
      <span>
        {`${geographic?.northing?.degrees}° ${geographic?.northing?.minutes}' ${geographic?.northing?.seconds}", `}
        {`${geographic?.easting?.degrees}° ${geographic?.easting?.minutes}' ${geographic?.easting?.seconds}"`}
      </span>
    </div>
    <div className="flex justify-between">
      <span className="font-semibold">Ellipsoid Height</span>
      <span>{`${geographic?.elevation} ${keyMap.unit(geographic?.unit)}`}</span>
    </div>
  </>
);

/**
 * @typedef {Object} GeographicCoordinateReviewProps
 * @property {Object} [geographic]
 * @property {Object} [geographic.northing]
 * @property {number} [geographic.northing.degrees]
 * @property {number} [geographic.northing.minutes]
 * @property {number} [geographic.northing.seconds]
 * @property {Object} [geographic.easting]
 * @property {number} [geographic.easting.degrees]
 * @property {number} [geographic.easting.minutes]
 * @property {number} [geographic.easting.seconds]
 * @property {number} [geographic.elevation]
 * @property {string} [geographic.unit]
 */

const ImagesReview = ({ images }) => {
  return (
    <Card>
      <h4 className="-mt-2 text-lg font-bold">Images and Extra Pages</h4>
      {Object.values(images).filter((x) => x).length > 0 ? (
        Object.entries(images).map((image) => {
          const [key, value] = image;
          if (!value) {
            return;
          }

          return <Image key={key} path={value} />;
        })
      ) : (
        <p className="text-center">This submission contains no images.</p>
      )}
    </Card>
  );
};

/**
 * @typedef {Object} ImagesReviewProps
 * @property {Object} [images]
 */

const Image = ({ path }) => {
  const { storage } = useFirebaseStorage();
  const [data, setData] = useState();
  getDownloadURL(ref(storage, path)).then(setData);

  return (
    <div className="flex flex-col items-center">
      {data ? <ObjectPreview url={data}>preview</ObjectPreview> : 'Loading...'}
    </div>
  );
};

/**
 * @typedef {Object} ImageProps
 * @property {string} [path]
 */

const AttachmentReview = ({ path }) => {
  const { storage } = useFirebaseStorage();
  const [data, setData] = useState();

  getDownloadURL(ref(storage, path)).then(setData);

  return (
    <Card>
      <h4 className="-mt-2 text-lg font-bold">Existing Monument Record Sheet</h4>
      <div className="contents h-[400px] max-w-[300px] justify-self-center">
        <Link href={data} target="_blank" rel="noopener noreferrer">
          Uploaded Tiesheet
        </Link>
        {data ? <ObjectPreview url={data}>preview</ObjectPreview> : 'loading...'}
      </div>
    </Card>
  );
};

/**
 * @typedef {Object} AttachmentReviewProps
 * @property {string} [path]
 */

const MonumentPreview = ({ status, children }) => {
  return (
    <Card>
      <h4 className="-mt-2 text-lg font-bold">Monument Record Sheet Preview</h4>
      {status === 'pending' && 'generating preview...'}
      {status === 'success' && (
        <div className="contents h-[400px] max-w-[300px] justify-self-center border">
          <ErrorBoundary fallback={<div>The preview could not be accessed.</div>}>{children}</ErrorBoundary>
        </div>
      )}
      {status === 'error' && 'error generating preview'}
    </Card>
  );
};

/**
 * @typedef {Object} MonumentPreviewProps
 * @property {string} [status]
 * @property {React.ReactNode} [children]
 */

const PdfPreview = ({ path }) => {
  const { storage } = useFirebaseStorage();
  const [data, setData] = useState();
  getDownloadURL(ref(storage, path)).then(setData);

  if (!data) {
    return <div className="flex flex-col items-center">Loading...</div>;
  }

  return <div className="flex flex-col items-center">{data && <ObjectPreview url={data}>preview</ObjectPreview>}</div>;
};

/**
 * @typedef {Object} PdfPreviewProps
 * @property {string} [path]
 */

export default Review;
