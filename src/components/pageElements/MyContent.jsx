import { Fragment, useState } from 'react';
import { Listbox, Switch, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { useImmerReducer } from 'use-immer';
import PropTypes from 'prop-types';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/outline';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  timeZone: 'MST',
});

const reducer = (draft, action) => {
  console.log(action);
  switch (action.type) {
    case 'set_selection': {
      draft.selectedItem = action.payload;
      break;
    }
    default: {
      break;
    }
  }
};

const MyContent = ({ content }) => {
  const [state, dispatch] = useImmerReducer(reducer, {
    selectedItem: null,
    items: content,
  });

  return state.selectedItem ? (
    <SelectedItem dispatch={dispatch} item={state.selectedItem}></SelectedItem>
  ) : (
    <>
      <h1 className="pb-6 text-2xl font-bold">My Content</h1>
      <ContentList dispatch={dispatch} content={content}></ContentList>
    </>
  );
};

MyContent.propTypes = {
  content: PropTypes.array,
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

const ContentList = ({ content, dispatch }) => (
  <div className="flex w-full flex-1 flex-col overflow-hidden">
    <SortOrder></SortOrder>
    <MapFilterToggle></MapFilterToggle>
    <ListCounter items={content}></ListCounter>
    <ItemList dispatch={dispatch} items={content}></ItemList>
  </div>
);
ContentList.propTypes = {
  content: PropTypes.array,
  dispatch: PropTypes.func,
};

const sortOrders = [
  'New to Old',
  'Old to New',
  'Ascending (0-9 A-Z)',
  'Descending (Z-A 0-9)',
];

const SortOrder = () => {
  const [selected, setSelected] = useState(sortOrders[0]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative z-10 mt-1">
        <Listbox.Label>Sort order</Listbox.Label>
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
          <span className="block truncate text-slate-800">{selected}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className="h-5 w-5 text-slate-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {sortOrders.map((option, id) => (
              <Listbox.Option
                key={id}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                  }`
                }
                value={option}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {option}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

const MapFilterToggle = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="mt-2">
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`${enabled ? 'bg-slate-500' : 'bg-slate-300'}
          relative inline-flex h-[20px] w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${enabled ? 'translate-x-4' : 'translate-x-0'}
            pointer-events-none inline-block h-4 w-4 transform rounded-full bg-indigo-400 shadow-lg ring-2 ring-indigo-900 transition duration-200 ease-in-out`}
        />
      </Switch>
      <div htmlFor="toggle" className="text-xs text-white">
        Only show content visible on the map
      </div>
    </div>
  );
};

const ListCounter = ({ items }) => (
  <label className="mt-6 mb-3">Showing 3 of {items.length}</label>
);
ListCounter.propTypes = {
  items: PropTypes.array,
};

const ItemList = ({ items, dispatch }) => (
  <section className="mb-4 inline-grid w-full gap-2 overflow-y-auto">
    {items.map((item) => (
      <Item dispatch={dispatch} key={item.attributes.id} item={item}></Item>
    ))}
  </section>
);
ItemList.propTypes = {
  items: PropTypes.array,
  dispatch: PropTypes.func,
};

const Item = ({ item, dispatch }) => {
  const [enabled, setEnabled] = useState(false);

  return (
    <>
      <div className="flex w-full flex-col">
        <div>
          <Switch
            checked={enabled}
            onChange={setEnabled}
            className={`${enabled ? 'bg-slate-500' : 'bg-slate-300'}
          relative inline-flex h-[16px] w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
          >
            <span className="sr-only">Use setting</span>
            <span
              aria-hidden="true"
              className={`${enabled ? 'translate-x-3' : 'translate-x-0'}
            pointer-events-none inline-block h-3 w-3 transform rounded-full bg-indigo-400 shadow-lg ring-2 ring-indigo-900 transition duration-200 ease-in-out`}
            />
          </Switch>
          <button
            onClick={() => dispatch({ payload: item, type: 'set_selection' })}
            className="inline-block pl-2 text-left"
          >
            {item.attributes.name}
          </button>
        </div>
        <p className="pl-5 text-xs text-slate-400">
          {dateFormatter.format(Date.parse(item.attributes.when))}
        </p>
        <p className="pl-5 text-xs text-slate-400">{item.attributes.notes}</p>
      </div>
      <span className="mx-auto inline-block h-1 w-2/3 rounded bg-slate-500"></span>
    </>
  );
};

Item.propTypes = {
  item: PropTypes.object,
  dispatch: PropTypes.func,
};

export default MyContent;
