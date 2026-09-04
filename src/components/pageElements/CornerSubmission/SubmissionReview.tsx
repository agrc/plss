import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDatum, keyMap } from '@ugrc/plss-shared';
import { geographic as geographicOptions, grid as gridOptions } from '@ugrc/plss-shared/corner-submission/options';
import type { ExistingSheet, Metadata, Images as SubmissionImages } from '@ugrc/plss-shared/corner-submission/schema';
import { useFirebaseFunctions } from '@ugrc/utah-design-system/contexts/FirebaseFunctionsProvider';
import { useFirebaseStorage } from '@ugrc/utah-design-system/contexts/FirebaseStorageProvider';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref } from 'firebase/storage';
import { type ReactNode, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSubmissionContext } from '../../contexts/SubmissionContext.tsx';
import { Link } from '../../formElements/Buttons.tsx';
import Card from '../../formElements/Card.tsx';
import { ObjectPreview } from '../../formElements/FileUpload.tsx';
import usePageView from '../../hooks/usePageView.ts';
import type { GeographicCoordinates, GridCoordinates, SubmissionMachineContext } from '../../machines/index.ts';
import Wizard from './Wizard.tsx';

type ReviewContext = SubmissionMachineContext & {
  blmPointId?: string;
  existing?: ExistingSheet;
  images?: SubmissionImages;
  metadata?: Metadata;
};

const Review = () => {
  const [state, send] = useSubmissionContext();
  const context = state.context as ReviewContext;

  usePageView('screen-submission-review');

  const { functions } = useFirebaseFunctions();
  const saveCorner = httpsCallable(functions, 'postCorner');
  const generatePreview = httpsCallable(functions, 'postGeneratePreview');
  const queryClient = useQueryClient();

  const { data, status } = useQuery({
    enabled: context.type === 'new',
    queryKey: ['monument record sheet', context.blmPointId, { preview: true }, context],
    queryFn: () => generatePreview(context),
    staleTime: 5000, // 5 seconds,
  });
  const { mutate, status: mutationStatus } = useMutation({
    mutationKey: ['submit corner', context.blmPointId],
    mutationFn: (submission: ReviewContext) => saveCorner(submission),
    onSuccess: async (response) => {
      console.log('success', response);
      await queryClient.cancelQueries();

      queryClient.invalidateQueries({ queryKey: ['my content'] });
      queryClient.removeQueries({ queryKey: ['monument record sheet'] });

      send({ type: 'NEXT' });
    },
    onError: (error) => {
      console.warn('error', error);
      send({ type: 'ERROR' });
    },
  });

  return (
    <>
      <div className="grid gap-2">
        <div className="mb-1 flex flex-col text-center">
          <h2 className="text-2xl font-bold uppercase">Corner Submission Review</h2>
          <h3 className="ml-2 text-xl font-light">{context.blmPointId}</h3>
        </div>
        {context.type !== 'existing' && context.metadata && <MetadataReview {...context.metadata} />}
        <CoordinateReview datum={context.datum} grid={context.grid} geographic={context.geographic} />
        {context.type === 'existing' && context.existing?.mrrc && (
          <div className="relative">
            <div className="absolute top-0 right-0 rounded-sm border border-sky-800 bg-sky-300 px-2 text-sm text-sky-800 uppercase shadow-sm">
              MRRC
            </div>
          </div>
        )}
        {context.type === 'existing' ? (
          <AttachmentReview path={context.existing?.pdf} />
        ) : (
          <ImagesReview images={context.images} />
        )}
        {context.type === 'new' && (
          <MonumentPreview status={status}>
            <PdfPreview path={typeof data?.data === 'string' ? data.data : undefined} />
          </MonumentPreview>
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <Wizard
          back={() => send({ type: 'BACK' })}
          status={mutationStatus === 'idle' ? undefined : mutationStatus}
          finish={() => mutate(context)}
        />
      </div>
    </>
  );
};

const MetadataReview = ({ accuracy, collected, corner, description, mrrc, notes, section, status }: Metadata) => {
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
        <span className="ml-4">{String(collected)}</span>
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

type CoordinateReviewProps = {
  datum?: string;
  geographic?: GeographicCoordinates;
  grid?: GridCoordinates;
};

const CoordinateReview = ({ datum, grid, geographic }: CoordinateReviewProps) => {
  if (!datum) {
    return (
      <Card>
        <h4 className="-mt-2 text-lg font-bold">Primary Coordinates</h4>
        <div>No coordinates were specified with this submission</div>
      </Card>
    );
  }

  let calculated: string = geographicOptions[0].label;
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

const GridCoordinateReview = ({ grid }: Pick<CoordinateReviewProps, 'grid'>) => (
  <>
    <div className="flex justify-between">
      <span className="font-semibold">Zone</span>
      <span>{keyMap.zone(grid?.zone ?? '')}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-semibold">Unit</span>
      <span>{keyMap.unit(grid?.unit ?? '')}</span>
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

const GeographicCoordinateReview = ({ geographic }: Pick<CoordinateReviewProps, 'geographic'>) => (
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
      <span>{`${geographic?.elevation} ${keyMap.unit(geographic?.unit ?? '')}`}</span>
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

const ImagesReview = ({ images }: { images?: SubmissionImages }) => {
  return (
    <Card>
      <h4 className="-mt-2 text-lg font-bold">Images and Extra Pages</h4>
      {Object.values(images ?? {}).filter((image) => image).length > 0 ? (
        Object.entries(images ?? {}).map(([key, value]) => {
          if (!value) {
            return null;
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

const useStorageUrl = (path?: string): string | undefined => {
  const { storage } = useFirebaseStorage();
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!path) {
      setUrl(undefined);
      return;
    }

    getDownloadURL(ref(storage, path))
      .then(setUrl)
      .catch(() => setUrl(undefined));
  }, [path, storage]);

  return url;
};

const Image = ({ path }: { path: string }) => {
  const data = useStorageUrl(path);

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

const AttachmentReview = ({ path }: { path?: string }) => {
  const data = useStorageUrl(path);

  return (
    <Card>
      <h4 className="-mt-2 text-lg font-bold">Existing Monument Record Sheet</h4>
      <div className="contents h-100 max-w-75 justify-self-center">
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

type MonumentPreviewProps = {
  children?: ReactNode;
  status: 'pending' | 'error' | 'success';
};

const MonumentPreview = ({ status, children }: MonumentPreviewProps) => {
  return (
    <Card>
      <h4 className="-mt-2 text-lg font-bold">Monument Record Sheet Preview</h4>
      {status === 'pending' && 'generating preview...'}
      {status === 'success' && (
        <div className="contents h-100 max-w-75 justify-self-center border">
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

const PdfPreview = ({ path }: { path?: string }) => {
  const data = useStorageUrl(path);

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
