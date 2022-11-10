import { useContext } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from 'reactfire';
import { SubmissionContext } from '../../contexts/SubmissionContext.jsx';
import Wizard from './Wizard.jsx';
import { keyMap, formatDatum } from '../../helpers/index.mjs';
import Card from '../../formElements/Card.jsx';
import {
  geographic as geographicOptions,
  grid as gridOptions,
} from './Options.mjs';
import { ImagePreview } from './Images.jsx';
import { A } from '../../formElements/Buttons.jsx';

const Review = () => {
  const [state, send] = useContext(SubmissionContext);

  const functions = useFunctions();
  const saveCorner = httpsCallable(functions, 'functions-httpsPostCorner');
  const { mutate } = useMutation(
    ['save-corner', state.context.blmPointId],
    (data) => saveCorner(data),
    {
      onSuccess: (response) => {
        console.log('success', response);
        state.context = undefined;
        send({ type: 'NEXT' });
      },
      onError: (error) => {
        console.log('error', error);
      },
    }
  );

  return (
    <>
      <div className="grid gap-2">
        {state.context.type !== 'existing' && (
          <MetadataReview
            blmPointId={state.context.blmPointId}
            {...state.context.metadata}
          />
        )}
        <CoordinateReview
          datum={state.context.datum}
          grid={state.context.grid}
          geographic={state.context.geographic}
        />
        {state.context.type === 'existing' ? (
          <AttachmentReview pdf={state.context.existing.pdf} />
        ) : (
          <ImagesReview images={state.context.images} />
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <Wizard
          back={() => send('BACK')}
          finish={async () => {
            await mutate(state.context);
          }}
        />
      </div>
    </>
  );
};

const MetadataReview = ({
  blmPointId,
  status,
  notes,
  description,
  accuracy,
}) => {
  return (
    <>
      <div className="mb-1 flex flex-col text-center">
        <h1 className="text-2xl font-bold uppercase">
          Corner Submission Review
        </h1>
        <h2 className="ml-2 text-xl font-light">{blmPointId}</h2>
      </div>
      <Card>
        <h3 className="-mt-2 text-lg font-bold">Metadata</h3>
        <div className="flex justify-between">
          <span className="font-semibold">Monument Status</span>
          <span className="ml-4">{keyMap.status(status)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Accuracy</span>
          <span className="ml-4">{keyMap.accuracy(accuracy)}</span>
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
    </>
  );
};
MetadataReview.propTypes = {
  blmPointId: PropTypes.string,
  status: PropTypes.string,
  notes: PropTypes.string,
  description: PropTypes.string,
  accuracy: PropTypes.string,
};

const CoordinateReview = ({ datum, grid, geographic }) => {
  if (!datum) {
    return null;
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
    coordinates[0] = <GridCoordinateReview grid={grid} />;
    coordinates[1] = <GeographicCoordinateReview geographic={geographic} />;
  }

  return (
    <>
      <Card>
        <h3 className="-mt-2 text-lg font-bold">Primary Coordinates</h3>
        <div className="flex justify-between">
          <span className="font-semibold">Datum</span>
          <span>{formatDatum(datum)}</span>
        </div>
        {coordinates[0]}
        <h3 className="py-2 text-lg font-bold text-slate-400">
          Calculated Coordinates
        </h3>
        <div className="flex justify-between">
          <span className="font-semibold">Datum</span>
          <span>{calculated}</span>
        </div>
        {coordinates[1]}
      </Card>
    </>
  );
};
CoordinateReview.propTypes = {
  datum: PropTypes.string.isRequired,
  grid: PropTypes.shape({
    zone: PropTypes.string,
    northing: PropTypes.number,
    easting: PropTypes.number,
    elevation: PropTypes.number,
    unit: PropTypes.string,
  }),
  geographic: PropTypes.shape({
    northing: PropTypes.shape({
      degrees: PropTypes.number,
      minutes: PropTypes.number,
      seconds: PropTypes.number,
    }),
    easting: PropTypes.shape({
      degrees: PropTypes.number,
      minutes: PropTypes.number,
      seconds: PropTypes.number,
    }),
    elevation: PropTypes.number,
    unit: PropTypes.string,
  }),
};

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
GridCoordinateReview.propTypes = {
  grid: PropTypes.shape({
    zone: PropTypes.string,
    northing: PropTypes.number,
    easting: PropTypes.number,
    elevation: PropTypes.number,
    unit: PropTypes.string,
    verticalDatum: PropTypes.string,
  }),
};

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
GeographicCoordinateReview.propTypes = {
  geographic: PropTypes.shape({
    northing: PropTypes.shape({
      degrees: PropTypes.number,
      minutes: PropTypes.number,
      seconds: PropTypes.number,
    }),
    easting: PropTypes.shape({
      degrees: PropTypes.number,
      minutes: PropTypes.number,
      seconds: PropTypes.number,
    }),
    elevation: PropTypes.number,
    unit: PropTypes.string,
  }),
};

const ImagesReview = ({ images }) => {
  return (
    <Card>
      <h3 className="-mt-2 text-lg font-bold">Images</h3>
      {Object.values(images).filter((x) => x).length > 0 ? (
        Object.entries(images).map((image) => {
          const [key, value] = image;
          if (!value) {
            return;
          }

          return (
            <div key={key} className="flex flex-col items-center">
              <ImagePreview storagePath={value} />
            </div>
          );
        })
      ) : (
        <p className="text-center">This submission contains no images.</p>
      )}
    </Card>
  );
};
ImagesReview.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
};

const AttachmentReview = ({ pdf }) => {
  return (
    <Card>
      <h3 className="-mt-2 text-lg font-bold">Tiesheet</h3>
      {pdf && (
        <A href={pdf} target="_blank" rel="noopener noreferrer">
          Uploaded Tiesheet
        </A>
      )}
    </Card>
  );
};
AttachmentReview.propTypes = {
  pdf: PropTypes.string,
};

export default Review;
