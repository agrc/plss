import clsx from 'clsx';
import * as React from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

const legendItems = [
  {
    name: 'County Managed',
    color: {
      r: 124,
      g: 226,
      b: 69,
      toString: function () {
        return `rgb(${this.r},${this.g},${this.b})`;
      },
    },
  },
  {
    name: 'Monument Record',
    color: {
      r: 180,
      g: 52,
      b: 246,
      toString: function () {
        return `rgb(${this.r},${this.g},${this.b})`;
      },
    },
  },
  {
    name: 'Control',
    color: {
      r: 0,
      g: 0,
      b: 0,
      toString: function () {
        return `rgb(${this.r},${this.g},${this.b})`;
      },
    },
  },
  {
    name: 'Calculated',
    color: {
      r: 244,
      g: 173,
      b: 61,
      toString: function () {
        return `rgb(${this.r},${this.g},${this.b})`;
      },
    },
  },
  {
    name: 'Pending',
    color: {
      r: 26,
      g: 34,
      b: 229,
      toString: function () {
        return `rgb(${this.r},${this.g},${this.b})`;
      },
    },
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

const MapLayers = ({ activeLayers, dispatch }) => (
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
            <ReferencePill
              key={key}
              {...item}
              activeLayers={activeLayers}
              onClick={() =>
                dispatch({
                  type: 'map-layers/click',
                  payload: item.name,
                })
              }
            />
          ))}
        </section>
      </TabPanel>
    </Tabs>
  </>
);

const getBrightness = ({ r, g, b }) => (r * 299 + g * 587 + b * 114) / 1000;

const LegendPill = ({ name, color }) => {
  const brightBg = getBrightness(color) > 128;
  const classes = clsx({
    'text-white': !brightBg,
    'text-black': brightBg,
  });

  return (
    <div
      style={{ backgroundColor: color.toString() }}
      className="flex justify-center px-3 py-2 text-sm font-bold tracking-wider border border-gray-800 rounded-lg"
    >
      <span className={classes}>{name}</span>
    </div>
  );
};

const ReferencePill = ({ name, activeLayers, onClick }) => {
  const active = activeLayers.includes(name);

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
      'cursor-pointer',
    ],
    { 'bg-indigo-300': active },
    { 'bg-white': !active }
  );
  return (
    <div className={classes} onClick={onClick}>
      <span className="py-1 text-center text-black">{name}</span>
    </div>
  );
};

export default MapLayers;
