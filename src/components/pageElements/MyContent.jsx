import { Tab } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref } from 'firebase/storage';
import { deleteDoc, doc, getFirestore } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  FirestoreProvider,
  useAnalytics,
  useFirebaseApp,
  useFirestore,
  useFunctions,
  useSigninCheck,
  useStorage,
  useUser,
} from 'reactfire';
// eslint-disable-next-line import/no-unresolved
import { useOpenClosed } from '@ugrc/utilities/hooks';
import { Button, Link } from '../formElements/Buttons.jsx';
import Card from '../formElements/Card.jsx';
import { ObjectPreview } from '../formElements/FileUpload.jsx';
import { Select } from '../formElements/Select.jsx';
import { timeSince } from '../helpers/index.mjs';
import Spacer from '../formElements/Spacer.jsx';
import usePageView from '../hooks/usePageView.jsx';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  timeZone: 'MST',
});

const tabs = ['Submissions', 'Reference Points'];

const MyContent = ({ dispatch }) => {
  const { data: signInCheckResult } = useSigninCheck();
  const [selectedTab, setSelectedTab] = useState();

  const { analytics, logEvent } = usePageView('screen-my-content');

  const functions = useFunctions();
  const myPoints = httpsCallable(functions, 'functions-httpsGetMyContent');

  const { data, status } = useQuery({
    queryKey: ['my content'],
    queryFn: myPoints,
    enabled: signInCheckResult?.signedIn === true,
    staleTime: Infinity,
  });

  return (
    <>
      <h2 className="text-2xl font-semibold">My Content</h2>
      <Spacer className="mb-2" />
      <section className="grid gap-2">
        <Tab.Group
          selectedIndex={selectedTab}
          onChange={(event) => {
            setSelectedTab(event);
            logEvent(analytics, 'my-content-tab-change', {
              tab: tabs[event],
            });
          }}
        >
          <Tab.List className="flex space-x-1 rounded-xl bg-sky-500/20 p-1">
            {tabs.map((name) => (
              <Tab
                key={name}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'border border-sky-600 bg-sky-500 text-white shadow hover:border-sky-700 hover:bg-sky-600 focus:border-sky-500 focus:ring-sky-600 active:bg-sky-700'
                      : 'text-sky-700 hover:bg-sky-600/20'
                  )
                }
              >
                {name}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {tabs.map((name) => (
              <Tab.Panel key={name}>
                {status !== 'success' && (
                  <Card>
                    <p className="flex">
                      {status === 'error' ? (
                        'error loading content'
                      ) : (
                        <>
                          <svg
                            className="-ml-1 mr-2 h-5 w-5 animate-spin motion-reduce:hidden"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          loading content...
                        </>
                      )}
                    </p>
                  </Card>
                )}
                {status === 'success' && name === 'Submissions' && (
                  <Submissions
                    items={data.data.submissions}
                    dispatch={dispatch}
                  />
                )}
                {status === 'success' && name === 'Reference Points' && (
                  <ReferencePoints
                    items={data.data.points}
                    dispatch={dispatch}
                  />
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </section>
    </>
  );
};
MyContent.propTypes = {
  dispatch: PropTypes.func,
};

const ReferencePoints = ({ items, dispatch }) => {
  const [sortOrder, setSortOrder] = useState(sortOrders[0]);
  const app = useFirebaseApp();
  const firestore = getFirestore(app);

  if ((items?.length ?? 0) < 1) {
    return (
      <Card>
        <h4 className="text-xl">Your reference point list is empty</h4>
        <p>
          You can create reference points in the{' '}
          <Button
            style="link"
            onClick={() => dispatch({ type: 'menu/toggle', payload: 'points' })}
          >
            Add Reference Point
          </Button>{' '}
          section
        </p>
      </Card>
    );
  }

  return (
    <FirestoreProvider sdk={firestore}>
      <section className="inline-grid w-full gap-2">
        <Card>
          <Select
            label="Sort order"
            options={sortOrders}
            value={sortOrder}
            onChange={setSortOrder}
          ></Select>
        </Card>
        <Card>
          <ItemList
            dispatch={dispatch}
            items={items}
            sortOrder={sortOrder}
          ></ItemList>
        </Card>
      </section>
    </FirestoreProvider>
  );
};
ReferencePoints.propTypes = {
  items: PropTypes.array,
  dispatch: PropTypes.func,
};

const Submissions = ({ items, dispatch }) => {
  if (items?.length < 1) {
    return (
      <Card>
        <h4 className="text-xl">Your submission list is empty</h4>
        <p>
          You haven&apos;t submitted any monument record sheets yet. Start a
          submission by clicking on the corner points. Get out and survey!
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
            })
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
  const analytics = useAnalytics();
  const storage = useStorage();
  const [url, setUrl] = useState('');

  const { label, submitted, id, status, geometry, attributes } = item;
  const submission = Date.parse(submitted);

  try {
    getDownloadURL(ref(storage, attributes.ref)).then(setUrl);
  } catch (e) {
    logEvent(analytics, 'download-submission-error', {
      document: item.key,
    });
  }

  return (
    <div className="relative flex flex-col text-base">
      <span className="font-semibold">{id}</span>
      <div className="absolute top-0 right-0">
        <span
          className="flex select-none flex-col text-xs text-slate-500"
          alt={dateFormatter.format(submission)}
        >
          <span>submitted</span>
          <span>{timeSince(submission)}</span>
        </span>
      </div>
      <SubmissionStatus status={status} label={label} />
      <div className="mt-3 flex justify-center">
        {(url?.length ?? 0) > 0 ? (
          <Link
            style="primary"
            buttonGroup={{ left: true }}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
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
          onClick={() =>
            dispatch({ type: 'map/center-and-zoom', payload: geometry })
          }
        >
          Zoom
        </Button>
        <Button
          style="secondary"
          buttonGroup={{ right: true }}
          onClick={() => dispatch({ type: 'submission/cancel', payload: id })}
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

const getClassesForStatus = (status) => {
  switch (status) {
    case 'yes':
    case 'Approved':
      return 'font-bold text-emerald-500';
    case 'Rejected':
      return 'font-bold text-red-500';
    case 'waiting':
      return 'font-bold text-sky-500';
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

const SubmissionStatus = ({ status, label }) => (
  <>
    <span className="text-sm">{label}</span>
    <div className="grid auto-cols-max grid-flow-col items-center text-sm">
      <span className={getClassesForStatus(status.received)}>Received</span>
      <ChevronRightIcon className="h-4 w-4 text-slate-500" />
      <span className={getClassesForStatus(status.reviewed)}>
        {getReviewStatus(status.reviewed)}
      </span>
      <ChevronRightIcon className="h-4 w-4 text-slate-500" />
      <span className={getClassesForStatus(status.published)}>Published</span>
    </div>
  </>
);
SubmissionStatus.propTypes = {
  status: PropTypes.object,
  label: PropTypes.string,
};

const SelectedItem = ({ item, dispatch }) => (
  <>
    <ArrowLeftCircleIcon
      className="h-10 w-10"
      onClick={() => dispatch({ type: 'set_selection', payload: null })}
    />
    <h3 className="text-lg font-bold">{item.name}</h3>
    <div>{dateFormatter.format(item.when)}</div>
    <div className="flex justify-evenly">
      <button
        type="button"
        className="ripple inline-block rounded border-2 border-white bg-transparent px-6 py-2 text-center text-xs font-medium uppercase leading-6 text-white transition hover:bg-white hover:text-black focus:outline-none"
      >
        Edit
      </button>
      <button
        type="button"
        className="ripple inline-block rounded border-2 border-white bg-transparent px-6 py-2 text-center text-xs font-medium uppercase leading-6 text-white transition hover:bg-white hover:text-black focus:outline-none"
      >
        Delete
      </button>
    </div>
    <input type="checkbox" />
    <span>Hide on map</span>
    <div>{item.location}</div>
    <h2 className="text-lg">Notes</h2>
    <div>{item.notes}</div>
    <h2 className="text-lg">Photos</h2>
    <div>photo1</div>
  </>
);
SelectedItem.propTypes = {
  item: PropTypes.object,
  dispatch: PropTypes.func,
};

const sortOrders = [
  'New to Old',
  'Old to New',
  'Ascending (0-9 A-Z)',
  'Descending (Z-A 0-9)',
];

const sortFunction = (sortOrder, transform) => {
  return (one, two) => {
    const { a, b } = transform(one, two);
    switch (sortOrder) {
      case 'New to Old':
        return Date.parse(b) - Date.parse(a);
      case 'Old to New':
        return Date.parse(a) - Date.parse(b);
      case 'Ascending (0-9 A-Z)':
        return a.localeCompare(b);
      case 'Descending (Z-A 0-9)':
        return b.localeCompare(a);
      default:
        return 0;
    }
  };
};

const ItemList = ({ items, dispatch, sortOrder }) => {
  const clone = items.map((item) => item);

  return (
    <ul className="divide-y divide-slate-200">
      {clone
        .sort(
          sortFunction(sortOrder, (x, y) => {
            if (
              sortOrder === 'Ascending (0-9 A-Z)' ||
              sortOrder === 'Descending (Z-A 0-9)'
            ) {
              return { a: x.attributes.name, b: y.attributes.name };
            }

            return { a: x.attributes.when, b: y.attributes.when };
          })
        )
        .map((item) => {
          return (
            <li key={item.key} className="py-4 first:pt-0 last:pb-0">
              <Item dispatch={dispatch} key={item.key} item={item}></Item>
            </li>
          );
        })}
    </ul>
  );
};
ItemList.propTypes = {
  items: PropTypes.array,
  dispatch: PropTypes.func,
  sortOrder: PropTypes.string,
};

const Item = ({ item, dispatch }) => {
  const date = Date.parse(item.attributes.when);
  const [isOpen, { toggle }] = useOpenClosed(false);
  const [status, setStatus] = useState('idle');
  const db = useFirestore();
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  return (
    <div className="relative flex flex-col gap-2 text-base">
      <p
        className={clsx('max-w-xs font-semibold', {
          truncate: !isOpen,
        })}
      >
        {item.attributes.name}
      </p>
      <div className="absolute top-0 right-0">
        <span
          className="flex select-none flex-col text-xs text-slate-500"
          alt={dateFormatter.format(date)}
        >
          <span>created</span>
          <span>{timeSince(date)}</span>
        </span>
      </div>
      <p
        className={clsx('max-w-sm text-sm', {
          truncate: !isOpen,
        })}
      >
        {item.attributes.notes}
      </p>
      {isOpen && (
        <div>
          <div className="mb-4 mt-2 flex items-center text-slate-500">
            <span className="h-px flex-1 bg-slate-200"></span>
            <span className="mx-3 text-xs uppercase tracking-wide">photos</span>
            <span className="h-px flex-1 bg-slate-200"></span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {item.photos.length === 0 && (
              <Card>
                <p className="text-center">
                  No photos are attached to this point.
                </p>
              </Card>
            )}
            {item.photos.map((path) => (
              <Image key={path} path={path} />
            ))}
          </div>
        </div>
      )}
      <div className="mt-3 flex justify-center">
        <Button style="primary" buttonGroup={{ left: true }} onClick={toggle}>
          {isOpen ? 'Less' : 'More'}
        </Button>
        <Button
          style="alternate"
          buttonGroup={{ middle: true }}
          onClick={() =>
            dispatch({ type: 'map/center-and-zoom', payload: item.geometry })
          }
        >
          Zoom
        </Button>
        <Button
          style="secondary"
          state={status}
          buttonGroup={{ right: true }}
          onClick={async () => {
            try {
              setStatus('loading');
              await deleteDoc(
                doc(db, 'submitters', user.uid, 'points', item.attributes.id)
              );
              queryClient.invalidateQueries(['my content']);
              setStatus('success');
            } catch (error) {
              setStatus('error');
              console.error(error);
            }
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
Item.propTypes = {
  item: PropTypes.object,
  dispatch: PropTypes.func,
};

const Image = ({ path }) => {
  const storage = useStorage();
  const [data, setData] = useState();
  getDownloadURL(ref(storage, path)).then(setData);

  return (
    <div className="flex flex-col items-center">
      {data ? <ObjectPreview url={data}>preview</ObjectPreview> : 'Loading...'}
    </div>
  );
};
Image.propTypes = {
  path: PropTypes.string,
};

export default MyContent;
