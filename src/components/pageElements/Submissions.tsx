import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { timeSince } from '@ugrc/plss-shared';
import { useFirebaseAnalytics } from '@ugrc/utah-design-system/contexts/FirebaseAnalyticsProvider';
import { useFirebaseFunctions } from '@ugrc/utah-design-system/contexts/FirebaseFunctionsProvider';
import { useFirebaseStorage } from '@ugrc/utah-design-system/contexts/FirebaseStorageProvider';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Button, type ButtonState, Link } from '../formElements/Buttons.tsx';
import Card from '../formElements/Card.tsx';
import type { AppDispatch, SubmissionItem } from './contentTypes.ts';
import { dateFormatter, sortFunction } from './utils.ts';

type SubmissionsProps = {
  dispatch?: AppDispatch;
  items?: SubmissionItem[];
};

export const Submissions = ({ items, dispatch }: SubmissionsProps) => {
  if (!items || items.length < 1) {
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
        {[...items]
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

type SubmissionProps = {
  dispatch?: AppDispatch;
  item: SubmissionItem;
};

const Submission = ({ item, dispatch }: SubmissionProps) => {
  const logEvent = useFirebaseAnalytics();
  const { storage } = useFirebaseStorage();
  const [url, setUrl] = useState<string | undefined>();

  const { functions } = useFirebaseFunctions();
  const cancelSubmission = httpsCallable<{ key: string }, unknown>(functions, 'postCancelCorner');

  const queryClient = useQueryClient();
  const { mutate, status: mutationStatus } = useMutation({
    mutationFn: (data: { key: string }) => cancelSubmission(data),
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
  const storagePath = attributes.ref;
  const terminalReviewStatus = status.reviewed === 'approved' || status.reviewed === 'rejected';
  const cancelState: ButtonState | undefined = terminalReviewStatus
    ? 'disabled'
    : mutationStatus === 'idle'
      ? undefined
      : mutationStatus;

  useEffect(() => {
    if (!storagePath) {
      setUrl(undefined);
      return;
    }

    getDownloadURL(ref(storage, storagePath))
      .then(setUrl)
      .catch((error) => {
        console.error('error getting download URL for', error, storagePath);
        logEvent('download-submission-error', {
          document: item.key,
        });
      });
  }, [item.key, logEvent, storage, storagePath]);

  return (
    <div className="relative flex flex-col text-base">
      <span className="font-semibold">{id}</span>
      <div className="absolute top-0 right-0">
        <span className="flex flex-col text-xs text-slate-500 select-none" title={dateFormatter.format(submission)}>
          <span>submitted</span>
          <span>{timeSince(submission)}</span>
        </span>
      </div>
      <SubmissionStatus status={status} label={label} />
      <div className="mt-3 flex justify-center">
        {url ? (
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
          onClick={() => geometry && dispatch?.({ type: 'map/center-and-zoom', payload: geometry })}
        >
          Zoom
        </Button>
        <Button
          style="secondary"
          state={cancelState}
          buttonGroup={{ right: true }}
          onClick={() => !terminalReviewStatus && mutate({ key: item.key })}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

type SubmissionStatusProps = {
  label: string;
  status: SubmissionItem['status'];
};

const SubmissionStatus = ({ status, label }: SubmissionStatusProps) => (
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

const getClassesForStatus = (status: string | undefined): string => {
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

const getReviewStatus = (status: string | undefined): string | undefined => {
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
