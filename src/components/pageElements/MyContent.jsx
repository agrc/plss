import { useState } from 'react';
import PropTypes from 'prop-types';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { useSigninCheck, useFunctions } from 'reactfire';
import { httpsCallable } from 'firebase/functions';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { Select } from '../formElements/Select.jsx';
import { Switch } from '../formElements/Switch.jsx';
import Card from '../formElements/Card.jsx';
import { timeSince } from '../helpers/index.mjs';
import { Button } from '../formElements/Buttons.jsx';

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
      <h1 className="mb-2 text-2xl font-bold">My Content</h1>
      <section className="grid gap-2">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
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
                {status !== 'success' && 'loading'}
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

  return (
    <section className="inline-grid w-full gap-2">
      <Card>
        <Select
          label="Sort order"
          options={sortOrders}
          value={sortOrder}
          onChange={setSortOrder}
        ></Select>
        <MapFilterToggle></MapFilterToggle>
      </Card>
      <Card>
        <ListCounter items={items}></ListCounter>
        <ItemList
          dispatch={dispatch}
          items={items}
          sortOrder={sortOrder}
        ></ItemList>
      </Card>
    </section>
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
            <li key={item.id} className="py-4 first:pt-0 last:pb-0">
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
  const { label, submitted, id, status, geometry } = item;
  const submission = Date.parse(submitted);

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
      <div className="mt-3 flex justify-between">
        <Button
          style="alternate"
          onClick={() =>
            dispatch({ type: 'map/center-and-zoom', payload: geometry })
          }
        >
          Zoom
        </Button>
        <Button
          style="alternate"
          onClick={() => dispatch({ type: 'submission/download', payload: id })}
        >
          Download
        </Button>
        <Button
          style="secondary"
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
    <h1 className="text-lg font-bold">{item.name}</h1>
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

const MapFilterToggle = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="flex items-center">
      <Switch
        value={enabled}
        onChange={() => setEnabled(!enabled)}
        hideLabel={true}
      />
      <span className="pl-2 text-sm">Only show content visible on the map</span>
    </div>
  );
};

const ListCounter = ({ items }) => (
  <label className="mb-3">
    Showing {items.length} of {items.length}
  </label>
);
ListCounter.propTypes = {
  items: PropTypes.array,
};

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
            <li key={item.attributes.id} className="py-4 first:pt-0 last:pb-0">
              <Item
                dispatch={dispatch}
                key={item.attributes.id}
                item={item}
              ></Item>
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

  return (
    <div className="relative flex flex-col text-base">
      <span className="font-semibold">{item.attributes.name}</span>
      <div className="absolute top-0 right-0">
        <span
          className="flex select-none flex-col items-center text-xs text-slate-500"
          alt={dateFormatter.format(date)}
        >
          <span>created</span>
          <span>{timeSince(date)}</span>
        </span>
      </div>
      <span className="text-sm">{item.attributes.notes}</span>
      <div className="mt-3 flex justify-between">
        <Button
          style="alternate"
          onClick={() =>
            dispatch({ type: 'map/center-and-zoom', payload: item.geometry })
          }
        >
          Zoom
        </Button>
        <Button style="alternate" onClick={() => dispatch()}>
          Hide
        </Button>
        <Button style="secondary" onClick={() => dispatch()}>
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

export default MyContent;
