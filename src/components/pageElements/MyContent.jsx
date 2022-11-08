import { useState } from 'react';
import PropTypes from 'prop-types';
import { useImmerReducer } from 'use-immer';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/outline';
import { Select } from '../formElements/Select.jsx';
import Switch from '../formElements/Switch.jsx';

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
    <Select
      label="Sort order"
      options={sortOrders}
      currentValue={sortOrders[0]}
    ></Select>
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

const MapFilterToggle = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="flex items-center">
      <Switch
        currentValue={enabled}
        onUpdate={() => setEnabled(!enabled)}
        hideLabel={true}
      />
      <span className="pl-2 text-sm">Only show content visible on the map</span>
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
  return (
    <>
      <div className="flex w-full flex-col">
        <div className="flex flex-row">
          <Switch hideLabel={true} />
          <button
            onClick={() => dispatch({ payload: item, type: 'set_selection' })}
            className="inline-block pl-2 text-left"
          >
            {item.attributes.name}
          </button>
        </div>
        <p className="pl-16 text-xs text-slate-400">
          {dateFormatter.format(Date.parse(item.attributes.when))}
        </p>
        <p className="pl-16 text-xs text-slate-400">{item.attributes.notes}</p>
      </div>
      <span className="mx-auto inline-block h-px w-2/3 rounded bg-sky-800"></span>
    </>
  );
};

Item.propTypes = {
  item: PropTypes.object,
  dispatch: PropTypes.func,
};

export default MyContent;
