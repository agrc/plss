import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/outline';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFirebaseAuth, useFirebaseFunctions, useFirebaseStorage, useFirestore } from '@ugrc/utah-design-system';
import { useOpenClosed } from '@ugrc/utilities/hooks';
import { clsx } from 'clsx';
import { deleteDoc, doc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getDownloadURL, ref } from 'firebase/storage';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { timeSince } from '../../../functions/shared/index.js';
import { Button } from '../formElements/Buttons.jsx';
import Card from '../formElements/Card.jsx';
import { ObjectPreview } from '../formElements/FileUpload.jsx';
import { Select } from '../formElements/Select.jsx';
import Spacer from '../formElements/Spacer.jsx';
import usePageView from '../hooks/usePageView.jsx';
import { Submissions } from './Submissions.jsx';
import { dateFormatter, sortFunction } from './utils.js';
const tabs = ['Submissions', 'Reference Points'];
const sortOrders = ['New to Old', 'Old to New', 'Ascending (0-9 A-Z)', 'Descending (Z-A 0-9)'];

const MyContent = ({ dispatch }) => {
  const { currentUser } = useFirebaseAuth();
  const [selectedTab, setSelectedTab] = useState();

  const { analytics, logEvent } = usePageView('screen-my-content');

  const { functions } = useFirebaseFunctions();
  const myPoints = httpsCallable(functions, 'getMyContent');

  const { data, status } = useQuery({
    queryKey: ['my content'],
    queryFn: myPoints,
    enabled: currentUser !== undefined,
    staleTime: Infinity,
  });

  return (
    <>
      <h2 className="text-2xl font-semibold">My Content</h2>
      <Spacer className="mb-2" />
      <section className="grid gap-2">
        <TabGroup
          selectedIndex={selectedTab}
          onChange={(event) => {
            setSelectedTab(event);
            logEvent(analytics, 'my-content-tab-change', {
              tab: tabs[event],
            });
          }}
        >
          <TabList className="flex space-x-1 rounded-xl bg-sky-500/20 p-1">
            {tabs.map((name) => (
              <Tab
                key={name}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 leading-5 font-medium',
                    'ring-white/60 ring-offset-2 ring-offset-sky-400 focus:ring-2 focus:outline-hidden',
                    selected
                      ? 'border border-sky-600 bg-sky-500 text-white shadow-sm hover:border-sky-700 hover:bg-sky-600 focus:border-sky-500 focus:ring-sky-600 active:bg-sky-700'
                      : 'text-sky-700 hover:bg-sky-600/20',
                  )
                }
              >
                {name}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {tabs.map((name) => (
              <TabPanel key={name}>
                {status !== 'success' && (
                  <Card>
                    <p className="flex">
                      {status === 'error' ? (
                        'error loading content'
                      ) : (
                        <>
                          <svg
                            className="mr-2 -ml-1 h-5 w-5 animate-spin motion-reduce:hidden"
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
                  <Submissions items={data.data.submissions} dispatch={dispatch} />
                )}
                {status === 'success' && name === 'Reference Points' && (
                  <ReferencePoints items={data.data.points} dispatch={dispatch} />
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </section>
    </>
  );
};
MyContent.propTypes = {
  dispatch: PropTypes.func,
};

const ReferencePoints = ({ items, dispatch }) => {
  const [sortOrder, setSortOrder] = useState(sortOrders[0]);

  if ((items?.length ?? 0) < 1) {
    return (
      <Card>
        <h4 className="text-xl">Your reference point list is empty</h4>
        <p>
          You can create reference points in the{' '}
          <Button style="link" onClick={() => dispatch({ type: 'menu/toggle', payload: 'points' })}>
            Add Reference Point
          </Button>{' '}
          section
        </p>
      </Card>
    );
  }

  return (
    <section className="inline-grid w-full gap-2">
      <Card>
        <Select label="Sort order" options={sortOrders} value={sortOrder} onChange={setSortOrder}></Select>
      </Card>
      <Card>
        <ItemList dispatch={dispatch} items={items} sortOrder={sortOrder}></ItemList>
      </Card>
    </section>
  );
};
ReferencePoints.propTypes = {
  items: PropTypes.array,
  dispatch: PropTypes.func,
};

const SelectedItem = ({ item, dispatch }) => (
  <>
    <ArrowLeftCircleIcon className="h-10 w-10" onClick={() => dispatch({ type: 'set_selection', payload: null })} />
    <h3 className="text-lg font-bold">{item.name}</h3>
    <div>{dateFormatter.format(item.when)}</div>
    <div className="flex justify-evenly">
      <button
        type="button"
        className="ripple inline-block rounded-sm border-2 border-white bg-transparent px-6 py-2 text-center text-xs leading-6 font-medium text-white uppercase transition hover:bg-white hover:text-black focus:outline-hidden"
      >
        Edit
      </button>
      <button
        type="button"
        className="ripple inline-block rounded-sm border-2 border-white bg-transparent px-6 py-2 text-center text-xs leading-6 font-medium text-white uppercase transition hover:bg-white hover:text-black focus:outline-hidden"
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

const ItemList = ({ items, dispatch, sortOrder }) => {
  const clone = items.map((item) => item);

  return (
    <ul className="divide-y divide-slate-200">
      {clone
        .sort(
          sortFunction(sortOrder, (x, y) => {
            if (sortOrder === 'Ascending (0-9 A-Z)' || sortOrder === 'Descending (Z-A 0-9)') {
              return { a: x.attributes.name, b: y.attributes.name };
            }

            return { a: x.attributes.when, b: y.attributes.when };
          }),
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
  const { firestore } = useFirestore();
  const queryClient = useQueryClient();
  const { currentUser } = useFirebaseAuth();

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
        <span className="flex flex-col text-xs text-slate-500 select-none" alt={dateFormatter.format(date)}>
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
          <div className="mt-2 mb-4 flex items-center text-slate-500">
            <span className="h-px flex-1 bg-slate-200"></span>
            <span className="mx-3 text-xs tracking-wide uppercase">photos</span>
            <span className="h-px flex-1 bg-slate-200"></span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {item.photos.length === 0 && (
              <Card>
                <p className="text-center">No photos are attached to this point.</p>
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
          onClick={() => dispatch({ type: 'map/center-and-zoom', payload: item.geometry })}
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
              await deleteDoc(doc(firestore, 'submitters', currentUser.uid, 'points', item.attributes.id));
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
  const { storage } = useFirebaseStorage();
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
