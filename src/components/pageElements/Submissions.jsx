import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirebaseAnalytics, useFirebaseFunctions, useFirebaseStorage } from '@ugrc/utah-design-system';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref } from 'firebase/storage';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { timeSince } from '../../../functions/shared/index.js';
import { Button, Link } from '../formElements/Buttons.jsx';
import Card from '../formElements/Card.jsx';
import { dateFormatter, sortFunction } from './utils.js';

export const Submissions = ({ items, dispatch }) => {
  if (items?.length < 1) {
    return (
      <Card>
        <h4 className="text-xl">Your submission list is empty</h4>
        <p>
          You haven&apos;t submitted any monument record sheets yet. Start a submission by clicking on the corner
          points. Get out and survey!
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <ul className="divide-y divide-slate-200">
        {items
          .sort(
            sortFunction('New to Old', (a, b) => {
              return { a: a.submitted, b: b.submitted };
            }),
          )
          .map((item) => (
            <li key={item.key} className="py-4 first:pt-0 last:pb-0">
              <Submission item={item} dispatch={dispatch} />
            </li>
          ))}
      </ul>
    </Card>
  );
};
Submissions.propTypes = {
  items: PropTypes.array,
  dispatch: PropTypes.func,
};

const Submission = ({ item, dispatch }) => {
  const logEvent = useFirebaseAnalytics();
  const { storage } = useFirebaseStorage();
  const [url, setUrl] = useState('');

  const { functions } = useFirebaseFunctions();
  const cancelSubmission = httpsCallable(functions, 'postCancelCorner');

  const queryClient = useQueryClient();
  const { mutate, status: mutationStatus } = useMutation({
    mutationFn: (data) => cancelSubmission(data),
    onSuccess: async (response) => {
      console.log('success', response);
      await queryClient.cancelQueries();

      queryClient.invalidateQueries({ queryKey: ['my content'] });
      queryClient.removeQueries({ queryKey: ['monument record sheet'] });
    },
    onError: (error) => {
      console.warn('error', error);
    },
  });

  const { label, submitted, id, status, geometry, attributes } = item;
  const submission = Date.parse(submitted);

  try {
    getDownloadURL(ref(storage, attributes.ref)).then(setUrl);
  } catch {
    logEvent('download-submission-error', {
      document: item.key,
    });
  }

  console.log('submission', { status, label, attributes });

  return (
    <div className="relative flex flex-col text-base">
      <span className="font-semibold">{id}</span>
      <div className="absolute top-0 right-0">
        <span className="flex flex-col text-xs text-slate-500 select-none" alt={dateFormatter.format(submission)}>
          <span>submitted</span>
          <span>{timeSince(submission)}</span>
        </span>
      </div>
      <SubmissionStatus status={status} label={label} />
      <div className="mt-3 flex justify-center">
        {(url?.length ?? 0) > 0 ? (
          <Link style="primary" buttonGroup={{ left: true }} href={url} target="_blank" rel="noopener noreferrer">
            Download
          </Link>
        ) : (
          <Button style="primary" buttonGroup={{ left: true }} state="disabled">
            Download
          </Button>
        )}
        <Button
          style="alternate"
          buttonGroup={{ middle: true }}
          onClick={() => dispatch({ type: 'map/center-and-zoom', payload: geometry })}
        >
          Zoom
        </Button>
        <Button
          style="secondary"
          state={mutationStatus}
          buttonGroup={{ right: true }}
          onClick={() => mutate({ key: item.key })}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
Submission.propTypes = {
  item: PropTypes.object,
  dispatch: PropTypes.func,
};

const SubmissionStatus = ({ status, label }) => (
  <>
    <span className="text-sm">{label}</span>
    <div className="grid auto-cols-max grid-flow-col items-center text-sm">
      <span className={getClassesForStatus(status.received)}>Received</span>
      <ChevronRightIcon className="h-4 w-4 text-slate-500" />
      <span className={getClassesForStatus(status.reviewed)}>{getReviewStatus(status.reviewed)}</span>
      <ChevronRightIcon className="h-4 w-4 text-slate-500" />
      <span className={getClassesForStatus(status.sheetPublished)}>Sheet Published</span>
      <ChevronRightIcon className="h-4 w-4 text-slate-500" />
      <span className={getClassesForStatus(status.dataPublished)}>Data Published</span>
    </div>
  </>
);
SubmissionStatus.propTypes = {
  status: PropTypes.object,
  label: PropTypes.string,
};

const getClassesForStatus = (status) => {
  switch (status) {
    case 'yes':
    case 'approved':
      return 'font-bold text-emerald-500';
    case 'rejected':
      return 'font-bold text-red-500';
    case 'waiting':
    case 'pending':
      return 'text-slate-500';
    default:
      return 'text-slate-500';
  }
};

const getReviewStatus = (status) => {
  switch (status) {
    case 'pending':
    case 'waiting':
      return 'Under Review';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
  }
};
