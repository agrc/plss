import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button } from '../../formElements/Buttons.jsx';
import { Input } from '../../formElements/Inputs.jsx';

const tabs = ['UTM', 'DD', 'DM', 'DMS'];

export default function Coordinates({ dispatch }) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  return (
    <section className="mx-auto grid max-w-prose gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log(e);
          dispatch({
            type: 'map/center-and-zoom',
            payload: e,
            meta: {
              scale: 4500,
            },
          });
        }}
      >
        <Tab.Group
          selectedIndex={selectedTabIndex}
          onChange={(e) => {
            setSelectedTabIndex(e);
          }}
        >
          <Tab.List className="flex space-x-1 rounded-xl bg-slate-500/20 p-1">
            {tabs.map((item) => (
              <Tab
                key={item}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-slate-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'border border-slate-600 bg-slate-500 text-white shadow hover:border-slate-700 hover:bg-slate-600 focus:border-slate-500 focus:ring-slate-600 active:bg-slate-700'
                      : 'text-slate-700 hover:bg-slate-600/20'
                  )
                }
              >
                {item}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="X"
                  placeholder="423712.68"
                  value=""
                  onChange={() => {}}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Y"
                  placeholder="4537314.52"
                  value=""
                  onChange={() => {}}
                />
              </div>
            </Tab.Panel>
            <Tab.Panel className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="Longitude"
                  placeholder="-111.88781"
                  value=""
                  onChange={() => {}}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Latitude"
                  placeholder="40.77699"
                  value=""
                  onChange={() => {}}
                />
              </div>
            </Tab.Panel>
            <Tab.Panel className="flex flex-col items-center gap-2">
              <div className="flex flex-row items-end gap-2">
                <Input
                  label="Longitude"
                  placeholder="degrees"
                  value=""
                  onChange={() => {}}
                />
                <Input placeholder="minutes" value="" onChange={() => {}} />
              </div>
              <div className="flex flex-row items-end gap-2">
                <Input
                  label="Latitude"
                  placeholder="degrees"
                  value=""
                  onChange={() => {}}
                />
                <Input placeholder="minutes" value="" onChange={() => {}} />
              </div>
            </Tab.Panel>
            <Tab.Panel className="flex flex-col items-center gap-2">
              <div className="flex flex-row items-end gap-2">
                <Input
                  label="Longitude"
                  placeholder="degrees"
                  value=""
                  onChange={() => {}}
                />
                <Input placeholder="minutes" value="" onChange={() => {}} />
                <Input placeholder="seconds" value="" onChange={() => {}} />
              </div>
              <div className="flex flex-row items-end gap-2">
                <Input
                  label="Latitude"
                  placeholder="degrees"
                  value=""
                  onChange={() => {}}
                />
                <Input placeholder="minutes" value="" onChange={() => {}} />
                <Input placeholder="seconds" value="" onChange={() => {}} />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
        <div className="mt-4 flex justify-center">
          <Button type="submit">Find</Button>
        </div>
      </form>
    </section>
  );
}
Coordinates.displayName = 'Coordinates';
Coordinates.propTypes = {
  dispatch: PropTypes.func,
};
