import clsx from 'clsx';
import * as React from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

const legendItems = [
  {
    name: 'County Managed',
    color: 'rgb(124,226,69)',
  },
  {
    name: 'Monument Record',
    color: 'rgb(180,52,246)',
  },
  {
    name: 'Control',
    color: 'black',
  },
  {
    name: 'Calculated',
    color: 'rgb(244,173,61)',
  },
  {
    name: 'Pending',
    color: 'rgb(26,34,229)',
  },
];

const referenceLayers = [
  {
    name: 'Land Ownership',
    color: 'white',
  },
  {
    name: 'Parcels',
    color: 'white',
  },
  {
    name: 'BLM CadNSDI',
    color: 'white',
  },
];

const MapLayers = () => (
  <>
    <h1 className="text-2xl font-bold">Map Layers</h1>
    <Tabs>
      <TabList>
        <Tab>Legend</Tab>
        <Tab>Reference Layers</Tab>
      </TabList>
      <TabPanel>
        <section className="inline-grid w-full gap-2 mb-4">
          {legendItems.map((item, key) => (
            <LegendPill key={key} {...item}></LegendPill>
          ))}
        </section>
      </TabPanel>
      <TabPanel>
        <section className="inline-grid w-full gap-2">
          {referenceLayers.map((item, key) => (
            <ReferencePill key={key} {...item}></ReferencePill>
          ))}
        </section>
      </TabPanel>
    </Tabs>
  </>
);

const LegendPill = ({ name, color }) => (
  <div
    style={{ backgroundColor: color }}
    className="flex justify-center px-3 py-2 text-sm font-bold tracking-wider border border-gray-800 rounded-lg"
  >
    <span className="w-full py-1 text-center bg-gray-800 rounded max-w-2/3">{name}</span>
  </div>
);

const ReferencePill = ({ name, active }) => {
  const classes = clsx(
    [
      'flex',
      'justify-center',
      'px-3',
      'py-2',
      'text-sm',
      'font-bold',
      'tracking-wider',
      'border',
      'border-gray-800',
      'rounded-lg',
    ],
    { 'bg-indigo-300': active },
    { 'bg-white': !active }
  );
  return (
    <div className={classes}>
      <span className="py-1 text-center text-black">{name}</span>
    </div>
  );
};

export default MapLayers;
