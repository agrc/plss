import { useImmerReducer } from 'use-immer';
import PropTypes from 'prop-types';
import { ArrowCircleLeftIcon } from '@heroicons/react/outline';

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
    <ArrowCircleLeftIcon
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

const ContentList = ({ items, dispatch }) => (
  <div className="flex w-full flex-1 flex-col overflow-hidden">
    <SortOrder></SortOrder>
    <MapFilterToggle></MapFilterToggle>
    <ListCounter items={items}></ListCounter>
    <ItemList dispatch={dispatch} items={items}></ItemList>
  </div>
);
ContentList.propTypes = {
  items: PropTypes.array,
  dispatch: PropTypes.func,
};

const SortOrder = () => (
  <div className="relative rounded-md shadow-sm">
    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      <span className="text-xs text-slate-500">Order</span>
    </div>
    <input
      type="text"
      className="block w-full rounded-md border-slate-300 pr-12 pl-7 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    />
    <div className="absolute inset-y-0 right-0 flex items-center">
      <label htmlFor="order" className="sr-only">
        Sort Order
      </label>
      <select
        id="order"
        className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-7 text-sm text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
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
    <div className="relative mr-2 inline-block w-10 select-none align-middle transition duration-200 ease-in">
      <input
        type="checkbox"
        name="toggle"
        id="toggle"
        className="toggle-checkbox absolute block h-6 w-6 cursor-pointer appearance-none rounded-full border-4 border-indigo-400 bg-white"
      />
      <span className="toggle-label block h-6 cursor-pointer overflow-hidden rounded-full bg-slate-300"></span>
    </div>
    <div htmlFor="toggle" className="text-xs text-white">
      Only show content visible on the map
    </div>
  </div>
);

const ListCounter = ({ items }) => (
  <label className="mt-6 mb-3">Showing 3 of {items.length}</label>
);
ListCounter.propTypes = {
  items: PropTypes.array,
};

const ItemList = ({ items, dispatch }) => (
  <section className="mb-4 inline-grid w-full gap-2 overflow-y-auto">
    {items.map((item) => (
      <Item dispatch={dispatch} key={item.id} item={item}></Item>
    ))}
  </section>
);
ItemList.propTypes = {
  items: PropTypes.array,
  dispatch: PropTypes.func,
};

const Item = ({ item, dispatch }) => (
  <>
    <div className="flex w-full flex-col">
      <div>
        <input type="checkbox" />
        <button
          onClick={() => dispatch({ payload: item, type: 'set_selection' })}
          className="inline-block pl-2 text-left"
        >
          {item.name}
        </button>
      </div>
      <p className="pl-5 text-xs text-slate-400">
        {dateFormatter.format(item.when)}
      </p>
    </div>
    <span className="mx-auto inline-block h-1 w-2/3 rounded bg-slate-500"></span>
  </>
);
Item.propTypes = {
  item: PropTypes.object,
  dispatch: PropTypes.func,
};

export default MyContent;
