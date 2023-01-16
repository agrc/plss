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
import usePageView from '../../hooks/usePageView.jsx';

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
  // TODO: move this to a reducer or an object
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedTownship, setSelectedTownship] = useState('');
  const [selectedRange, setSelectedRange] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const { analytics, logEvent } = usePageView('screen-township-finder');

  const { data: ranges } = useQuery({
    queryKey: ['ranges', tabs[selectedTabIndex].value, selectedTownship],
    queryFn: async () => {
      const predicate = `torrname='${tabs[selectedTabIndex].value}T${selectedTownship}'`;

      logEvent(analytics, 'township-finder', {
        type: 'range',
        predicate,
      });

      const response = await client
        .get('cadastre.plss_township_and_range_lookup/pairswith', {
          searchParams: {
            apiKey,
            predicate,
          },
        })
        .json();

      if (!response || response.status != 200) {
        logEvent(analytics, 'township-finder-error', {
          type: 'range',
          response,
        });

        throw new Error('Error fetching ranges');
      }

      const count = response?.result?.length ?? 0;

      if (count === 0 || count > 1) {
        logEvent(analytics, 'township-finder-error', {
          type: 'range',
          response,
        });

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
      const predicate = `trname='${tabs[selectedTabIndex].value}T${selectedTownship}R${selectedRange}'`;

      logEvent(analytics, 'township-finder', {
        type: 'section',
        predicate,
      });

      const response = await client
        .get('cadastre.plss_section_lookup/pairswith', {
          searchParams: {
            apiKey,
            predicate,
          },
        })
        .json();

      if (!response || response.status != 200) {
        logEvent(analytics, 'township-finder-error', {
          type: 'section',
          response,
        });

        throw new Error('Error fetching sections');
      }

      const count = response?.result?.length ?? 0;

      if (count === 0 || count > 1) {
        logEvent(analytics, 'township-finder-error', {
          type: 'section',
          response,
        });

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
      const predicate = composePredicate(
        tabs[selectedTabIndex].number,
        selectedTownship,
        selectedRange,
        selectedSection
      );

      logEvent(analytics, 'township-finder', {
        type: 'shape',
        predicate,
      });

      const response = await client
        .get('cadastre.plss_sections_gcdb/shape@envelope', {
          searchParams: {
            apiKey,
            predicate,
            spatialReference: 3857,
          },
        })
        .json();

      if (!response || response.status != 200) {
        logEvent(analytics, 'township-finder-error', {
          type: 'shape',
          response,
        });

        throw new Error('Error fetching envelope');
      }

      const count = response?.result?.length ?? 0;

      if (count === 0) {
        logEvent(analytics, 'township-finder-error', {
          type: 'shape',
          response,
        });

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
      <Tab.Group
        selectedIndex={selectedTabIndex}
        onChange={(e) => {
          setSelectedTabIndex(e);
          setSelectedTownship('');
          setSelectedRange('');
          setSelectedSection('');
        }}
      >
        <Tab.List className="flex space-x-1 rounded-xl bg-slate-500/20 p-1">
          {tabs.map((item) => (
            <Tab
              key={item.name}
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
      {status === 'error' && (
        <div className="rounded border border-rose-900 p-4 text-sm text-rose-800">
          There was a problem with this combination. Try again or try something
          near by to help you find your way.
        </div>
      )}
    </section>
  );
}
Township.displayName = 'Township';
Township.propTypes = {
  apiKey: PropTypes.string.isRequired,
  dispatch: PropTypes.func,
};
