import { Tab } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import ky from 'ky';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Select } from '../../formElements/Select.jsx';
import { sl, ub } from './townships.js';
import naturalCompare from 'natural-compare-lite';
import { Button } from '../../formElements/Buttons.jsx';

const client = ky.create({
  prefixUrl: 'https://api.mapserv.utah.gov/api/v1/search',
});

const tabs = [
  { name: 'Salt Lake', value: 'SL', number: 26 },
  { name: 'Uinta Basin', value: 'UB', number: 30 },
];

const getLabel = (meridian, township, range, section) => {
  if (!meridian || !township || !range) {
    return '';
  }

  var label = `${meridian}T${township}R${range}`;
  if (section) {
    label += `Sec${section}`;
  }

  return label;
};

const composePredicate = (meridian, township, range, section) => {
  const padded = section.padStart(2, '0');

  return `basemeridian='${meridian}' AND label='T${township} R${range}' AND section='${padded}'`;
};

export default function Township({ apiKey, dispatch }) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedTownship, setSelectedTownship] = useState('');
  const [selectedRange, setSelectedRange] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const { data: ranges } = useQuery({
    queryKey: ['ranges', tabs[selectedTabIndex].value, selectedTownship],
    queryFn: async () => {
      const response = await client
        .get('cadastre.plss_township_and_range_lookup/pairswith', {
          searchParams: {
            apiKey,
            predicate: `torrname='${tabs[selectedTabIndex].value}T${selectedTownship}'`,
          },
        })
        .json();

      if (!response || response.status != 200) {
        throw new Error('Error fetching ranges');
      }

      const count = response?.result?.length ?? 0;

      if (count === 0 || count > 1) {
        throw new Error('An incorrect response count was received.', count);
      }

      const data = response.result[0].attributes.pairswith
        .split('|')
        .map((x) => x.slice(1))
        .sort(naturalCompare);

      return data;
    },
    enabled: (selectedTownship?.length ?? 0) > 0,
    staleTime: Infinity,
  });

  const { data: sections } = useQuery({
    queryKey: [
      'sections',
      tabs[selectedTabIndex].value,
      selectedTownship,
      selectedRange,
    ],
    queryFn: async () => {
      const response = await client
        .get('cadastre.plss_section_lookup/pairswith', {
          searchParams: {
            apiKey,
            predicate: `trname='${tabs[selectedTabIndex].value}T${selectedTownship}R${selectedRange}'`,
          },
        })
        .json();

      if (!response || response.status != 200) {
        throw new Error('Error fetching sections');
      }

      const count = response?.result?.length ?? 0;

      if (count === 0 || count > 1) {
        throw new Error('An incorrect response count was received.', count);
      }

      const data = response.result[0].attributes.pairswith
        .split('|')
        .sort(naturalCompare);

      return data;
    },
    enabled: (selectedRange?.length ?? 0) > 0,
    staleTime: Infinity,
  });

  const { data: location, status } = useQuery({
    queryKey: [
      'location',
      tabs[selectedTabIndex].value,
      selectedTownship,
      selectedRange,
      selectedSection,
    ],
    queryFn: async () => {
      const response = await client
        .get('cadastre.plss_sections_gcdb/shape@envelope', {
          searchParams: {
            apiKey,
            predicate: composePredicate(
              tabs[selectedTabIndex].number,
              selectedTownship,
              selectedRange,
              selectedSection
            ),
            spatialReference: 3857,
          },
        })
        .json();

      if (!response || response.status != 200) {
        throw new Error('Error fetching envelope');
      }

      const count = response?.result?.length ?? 0;

      if (count === 0 || count > 1) {
        throw new Error('An incorrect response count was received.', count);
      }

      const data = response.result[0].geometry;

      return data;
    },
    enabled: (selectedSection?.length ?? 0) > 0,
    staleTime: Infinity,
  });

  return (
    <section className="mx-auto grid max-w-prose gap-2">
      <h1 className="mb-2 text-2xl font-bold">Section Finder</h1>
      <Tab.Group
        selectedIndex={selectedTabIndex}
        onChange={(e) => {
          setSelectedTabIndex(e);
          setSelectedTownship('');
          setSelectedRange('');
          setSelectedSection('');
        }}
      >
        <Tab.List className="flex space-x-1 rounded-xl bg-sky-500/20 p-1">
          {tabs.map((item) => (
            <Tab
              key={item.name}
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
              {item.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          {tabs.map((item) => (
            <Tab.Panel key={item.name}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex-1">
                  <Select
                    label="Township"
                    placeholder="Select the township"
                    value={selectedTownship}
                    options={item.name === 'Salt Lake' ? sl : ub}
                    onChange={(e) => {
                      setSelectedTownship(e);
                      setSelectedRange('');
                      setSelectedSection('');
                    }}
                  />
                </div>

                <div className="flex-1">
                  <Select
                    label="Range"
                    disabled={selectedTownship.length < 1}
                    placeholder={
                      selectedTownship
                        ? 'Select the range'
                        : 'Select the township'
                    }
                    options={ranges}
                    value={selectedRange}
                    onChange={(e) => {
                      setSelectedRange(e);
                      setSelectedSection('');
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Select
                    label="Section"
                    placeholder={
                      selectedTownship
                        ? 'Select the section'
                        : 'Select the township'
                    }
                    disabled={selectedRange.length < 1}
                    options={sections}
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e)}
                  />
                </div>
              </div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
      <div className="mt-4 flex justify-center">
        <Button
          state={selectedSection.length < 1 ? 'disabled' : status}
          onClick={() =>
            dispatch({
              type: 'map/center-and-zoom',
              payload: location,
              meta: {
                scale: 10000,
                label: getLabel(
                  tabs[selectedTabIndex].value,
                  selectedTownship,
                  selectedRange,
                  selectedSection
                ),
              },
            })
          }
        >
          Go
        </Button>
      </div>
    </section>
  );
}
Township.displayName = 'Township';
Township.propTypes = {
  apiKey: PropTypes.string.isRequired,
  dispatch: PropTypes.func,
};