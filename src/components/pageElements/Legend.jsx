import { Popover, PopoverButton, PopoverGroup, PopoverPanel, Transition } from '@headlessui/react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { contrastColor } from 'contrast-color';
import { Fragment } from 'react';
import Card from '../formElements/Card.jsx';
import Spacer from '../formElements/Spacer.jsx';
import usePageView from '../hooks/usePageView.jsx';

export default function Legend() {
  const { analytics, logEvent } = usePageView('screen-legend');

  return (
    <Card>
      <h2 className="text-2xl font-semibold">PLSS Points Legend</h2>
      <p className="text-sm leading-none">What do the colors mean? Click on the question mark to learn more.</p>
      <Spacer />
      <PopoverGroup as="section" className="flex flex-wrap justify-around gap-3">
        {layers.map((layer) => (
          <Popover key={layer.name}>
            <PopoverButton
              style={{
                backgroundColor: layer.color,
                color: contrastColor.call({}, { bgColor: layer.color }),
              }}
              className="group flex items-center rounded px-3 py-1 text-sm font-semibold shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
              key={layer.name}
              {...layer}
            >
              <span>{layer.name}</span>
              <QuestionMarkCircleIcon className="ml-2 h-5 w-5 transition duration-150 ease-in-out group-hover:text-opacity-80" />
            </PopoverButton>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <PopoverPanel className="absolute left-1/2 z-20 mt-2 w-60 -translate-x-1/2 transform px-4">
                {({ open }) => {
                  if (open) {
                    logEvent(analytics, 'legend-item-open', {
                      layer: layer.name,
                    });
                  }

                  return (
                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="bg-white px-3 py-2 text-sm text-slate-800">{layer.about}</div>
                    </div>
                  );
                }}
              </PopoverPanel>
            </Transition>
          </Popover>
        ))}
      </PopoverGroup>
    </Card>
  );
}

const layers = [
  {
    name: 'County Managed',
    color: '#7BE144',
    about: 'PLSS points whose monument record sheets and information are managed on a county website.',
  },
  {
    name: 'Monument Record',
    color: '#B433F6',
    about: 'PLSS points with an available monument record sheet.',
  },
  {
    name: 'Control',
    color: '#1A1A1A',
    about: 'PLSS points that have been incorporated into the PLSS Fabric as control points.',
  },
  {
    name: 'Calculated',
    color: '#F3AC3D',
    about:
      'PLSS points without monument record sheets whose location has been calculated from the PLSS Fabric and surrounding points.',
  },
  {
    name: 'MRRC Monument Record',
    color: '#73B2FF',
    about:
      'PLSS points with an available monument record sheet that was collected as part of the Monument Replacement and Restoration Committee (MRRC) grant program.',
  },
  {
    name: 'GCDB Points',
    color: '#fff',
    about: "The BLM's geographic coordinate database points.",
  },
];
