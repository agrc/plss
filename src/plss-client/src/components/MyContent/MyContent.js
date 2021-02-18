import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useImmerReducer } from 'use-immer';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  timeZone: 'MST',
});

const items = [
  {
    id: 0,
    name: 'Left Fk. Monument Marker',
    when: new Date(),
  },
  {
    id: 1,
    name: 'Shurtz Canyon Point',
    when: new Date(),
  },
  {
    id: 2,
    name: 'Santaquin Peak',
    when: new Date(),
  },
];

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

const MyContent = () => {
  const [state, dispatch] = useImmerReducer(reducer, {
    selectedItem: null,
    items,
  });

  return state.selectedItem ? (
    <SelectedItem dispatch={dispatch} item={state.selectedItem}></SelectedItem>
  ) : (
    <>
      <h1 className="pb-6 text-2xl font-bold">My Content</h1>
      <ContentList dispatch={dispatch} items={state.items}></ContentList>
    </>
  );
};

const SelectedItem = ({ item, dispatch }) => (
  <>
    <FontAwesomeIcon
      icon={faArrowLeft}
      fixedWidth
      size="2x"
      border
      pull="left"
      onClick={() => dispatch({ type: 'set_selection', payload: null })}
    />
    <h1 className="text-lg font-bold">{item.name}</h1>
    <div>{dateFormatter.format(item.when)}</div>
    <div className="flex justify-evenly">
      <button
        type="button"
        className="inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-white uppercase transition bg-transparent border-2 border-white rounded ripple hover:bg-white hover:text-black focus:outline-none"
      >
        Edit
      </button>
      <button
        type="button"
        className="inline-block px-6 py-2 text-xs font-medium leading-6 text-center text-white uppercase transition bg-transparent border-2 border-white rounded ripple hover:bg-white hover:text-black focus:outline-none"
      >
        Delete
      </button>
    </div>
    <input type="checkbox" />
    <label>Hide on map</label>
    <div>{item.location}</div>
    <h2 className="text-lg">Notes</h2>
    <div>{item.notes}</div>
    <h2 className="text-lg">Photos</h2>
    <div>photo1</div>
  </>
);

const ContentList = ({ items, dispatch }) => (
  <div className="flex flex-col flex-1 w-full overflow-hidden">
    <SortOrder></SortOrder>
    <MapFilterToggle></MapFilterToggle>
    <ListCounter items={items}></ListCounter>
    <ItemList dispatch={dispatch} items={items}></ItemList>
  </div>
);

const SortOrder = () => (
  <div className="relative rounded-md shadow-sm">
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <span className="text-xs text-gray-500">Order</span>
    </div>
    <input
      type="text"
      className="block w-full pr-12 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 pl-7 sm:text-sm"
    />
    <div className="absolute inset-y-0 right-0 flex items-center">
      <label htmlFor="order" className="sr-only">
        Sort Order
      </label>
      <select
        id="order"
        className="h-full py-0 pl-2 text-sm text-gray-500 bg-transparent border-transparent rounded-md focus:ring-indigo-500 focus:border-indigo-500 pr-7"
      >
        <option>New to Old</option>
        <option>Old to New</option>
        <option>Ascending (0-9 A-Z)</option>
        <option>Descending (Z-A 0-9)</option>
      </select>
    </div>
  </div>
);

const MapFilterToggle = () => (
  <div className="mt-2">
    <div className="relative inline-block w-10 mr-2 align-middle transition duration-200 ease-in select-none">
      <input
        type="checkbox"
        name="toggle"
        id="toggle"
        className="absolute block w-6 h-6 bg-white border-4 border-indigo-400 rounded-full appearance-none cursor-pointer toggle-checkbox"
      />
      <label
        htmlFor="toggle"
        className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer toggle-label"
      ></label>
    </div>
    <label htmlFor="toggle" className="text-xs text-white">
      Only show content visible on the map
    </label>
  </div>
);

const ListCounter = ({ items }) => <label className="mt-6 mb-3">Showing 3 of {items.length}</label>;

const ItemList = ({ items, dispatch }) => (
  <section className="inline-grid w-full gap-2 mb-4 overflow-y-auto">
    {items.map((item) => (
      <Item dispatch={dispatch} key={item.id} item={item}></Item>
    ))}
  </section>
);

const Item = ({ item, dispatch }) => (
  <>
    <div className="flex flex-col w-full">
      <div>
        <input type="checkbox" />
        <label
          onClick={() => dispatch({ payload: item, type: 'set_selection' })}
          className="inline-block pl-2 text-left"
        >
          {item.name}
        </label>
      </div>
      <p className="pl-5 text-xs text-gray-400">{dateFormatter.format(item.when)}</p>
    </div>
    <span class="inline-block h-1 w-2/3 rounded bg-gray-500 mx-auto"></span>
  </>
);

export default MyContent;
