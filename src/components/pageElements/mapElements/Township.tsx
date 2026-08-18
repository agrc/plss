import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import ky from 'ky';
import { compare } from 'natural-orderby';
import { useState } from 'react';
import { Button } from '../../formElements/Buttons.tsx';
import { Select } from '../../formElements/Select.tsx';
import usePageView from '../../hooks/usePageView.ts';
import type { AppDispatch } from '../contentTypes.ts';
import { sl, ub } from './townships.ts';

const client = ky.create({
  prefix: 'https://api.mapserv.utah.gov/api/v1/search',
});

const tabs = [
  { name: 'Salt Lake', value: 'SL', number: 26 },
  { name: 'Uinta Basin', value: 'UB', number: 30 },
] as const;

type PairsWithResponse = {
  result?: Array<{
    attributes: {
      pairswith: string;
    };
  }>;
  status: number;
};

type EnvelopeResponse = {
  result?: Array<{
    geometry: unknown;
  }>;
  status: number;
};

type TownshipProps = {
  apiKey: string;
  dispatch?: AppDispatch;
};

const getLabel = (meridian: string, township: string, range: string, section: string): string => {
  if (!meridian || !township || !range) {
    return '';
  }

  let label = `${meridian}T${township}R${range}`;
  if (section) {
    label += `Sec${section}`;
  }

  return label;
};

const composePredicate = (meridian: number, township: string, range: string, section: string): string => {
  const padded = section.padStart(2, '0');

  return `basemeridian='${meridian}' AND label='T${township} R${range}' AND section='${padded}'`;
};

export default function Township({ apiKey, dispatch }: TownshipProps) {
  // TODO: move this to a reducer or an object
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const selectedTab = tabs[selectedTabIndex] ?? tabs[0]!;
  const [selectedTownship, setSelectedTownship] = useState('');
  const [selectedRange, setSelectedRange] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const { analytics, logEvent } = usePageView('screen-township-finder');

  const { data: ranges } = useQuery({
    queryKey: ['ranges', selectedTab.value, selectedTownship, analytics, apiKey],
    queryFn: async () => {
      const predicate = `torrname='${selectedTab.value}T${selectedTownship}'`;

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
        .json<PairsWithResponse>();

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

        throw new Error(`An incorrect response count was received: ${count}`);
      }

      const result = response.result?.[0];
      if (!result) {
        throw new Error('A township range response was returned without data.');
      }

      const data = result.attributes.pairswith
        .split('|')
        .map((value) => value.slice(1))
        .sort(compare());

      return data;
    },
    enabled: (selectedTownship?.length ?? 0) > 0,
    staleTime: Infinity,
  });

  const { data: sections } = useQuery({
    queryKey: ['sections', selectedTab.value, selectedTownship, selectedRange, analytics, apiKey],
    queryFn: async () => {
      const predicate = `trname='${selectedTab.value}T${selectedTownship}R${selectedRange}'`;

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
        .json<PairsWithResponse>();

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

        throw new Error(`An incorrect response count was received: ${count}`);
      }

      const result = response.result?.[0];
      if (!result) {
        throw new Error('A township section response was returned without data.');
      }

      const data = result.attributes.pairswith.split('|').sort(compare());

      return data;
    },
    enabled: (selectedRange?.length ?? 0) > 0,
    staleTime: Infinity,
  });

  const { data: location, status } = useQuery({
    queryKey: [
      'location',
      selectedTab.value,
      selectedTab.number,
      selectedTownship,
      selectedRange,
      selectedSection,
      analytics,
      apiKey,
    ],
    queryFn: async () => {
      const predicate = composePredicate(selectedTab.number, selectedTownship, selectedRange, selectedSection);

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
        .json<EnvelopeResponse>();

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

        throw new Error(`An incorrect response count was received: ${count}`);
      }

      const result = response.result?.[0];
      if (!result) {
        throw new Error('A township envelope response was returned without geometry.');
      }

      const data = result.geometry;

      return data;
    },
    enabled: (selectedSection?.length ?? 0) > 0,
    staleTime: Infinity,
  });

  return (
    <section className="mx-auto grid max-w-prose gap-2">
      <TabGroup
        selectedIndex={selectedTabIndex}
        onChange={(e) => {
          setSelectedTabIndex(e);
          setSelectedTownship('');
          setSelectedRange('');
          setSelectedSection('');
        }}
      >
        <TabList className="flex space-x-1 rounded-xl bg-slate-500/20 p-1">
          {tabs.map((item) => (
            <Tab
              key={item.name}
              className={({ selected }) =>
                clsx(
                  'w-full rounded-lg py-2.5 leading-5 font-medium',
                  'ring-white/60 ring-offset-2 ring-offset-slate-400 focus:ring-2 focus:outline-hidden',
                  selected
                    ? 'border border-slate-600 bg-slate-500 text-white shadow-sm hover:border-slate-700 hover:bg-slate-600 focus:border-slate-500 focus:ring-slate-600 active:bg-slate-700'
                    : 'text-slate-700 hover:bg-slate-600/20',
                )
              }
            >
              {item.name}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((item) => (
            <TabPanel key={item.name}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex-1">
                  <Select
                    label="Township"
                    placeholder="Select the township"
                    value={selectedTownship}
                    options={item.name === 'Salt Lake' ? sl : ub}
                    onChange={(value) => {
                      setSelectedTownship(value ?? '');
                      setSelectedRange('');
                      setSelectedSection('');
                    }}
                  />
                </div>

                <div className="flex-1">
                  <Select
                    label="Range"
                    disabled={selectedTownship.length < 1}
                    placeholder={selectedTownship ? 'Select the range' : 'Select the township'}
                    options={ranges}
                    value={selectedRange}
                    onChange={(value) => {
                      setSelectedRange(value ?? '');
                      setSelectedSection('');
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Select
                    label="Section"
                    placeholder={selectedTownship ? 'Select the section' : 'Select the township'}
                    disabled={selectedRange.length < 1}
                    options={sections}
                    value={selectedSection}
                    onChange={(value) => setSelectedSection(value ?? '')}
                  />
                </div>
              </div>
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
      <div className="mt-4 flex justify-center">
        <Button
          state={selectedSection.length < 1 ? 'disabled' : status}
          onClick={() => {
            if (!location) {
              return;
            }

            dispatch?.({
              type: 'map/center-and-zoom',
              payload: location,
              meta: {
                scale: 10000,
                label: getLabel(selectedTab.value, selectedTownship, selectedRange, selectedSection),
              },
            });
          }}
        >
          Go
        </Button>
      </div>
      {status === 'error' && (
        <div className="rounded-sm border border-rose-900 p-4 text-sm text-rose-800">
          There was a problem with this combination. Try again or try something near by to help you find your way.
        </div>
      )}
    </section>
  );
}
Township.displayName = 'Township';
