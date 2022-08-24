import { Fragment } from 'react';
import { contrastColor } from 'contrast-color';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { Popover, Transition } from '@headlessui/react';

export default function Legend() {
  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">Map Layer Legend</h1>
      <Popover.Group
        as="section"
        className="flex flex-wrap justify-around gap-3"
      >
        {layers.map((layer) => (
          <Popover key={layer.name}>
            <Popover.Button
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
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-1/2 z-20 mt-2 w-60 -translate-x-1/2 transform px-4">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="bg-white px-3 py-2 text-sm text-slate-800">
                    {layer.about}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>
        ))}
      </Popover.Group>
    </main>
  );
}

const layers = [
  {
    name: 'County Managed',
    color: '#7BE144',
    about:
      'Sed nisi lacus sed viverra tellus in. Odio ut enim blandit volutpat. Sed felis eget velit aliquet sagittis id consectetur. Dui faucibus in ornare quam viverra orci sagittis. Tortor pretium viverra suspendisse potenti nullam. Malesuada proin libero nunc consequat interdum varius. Sit amet aliquam id diam maecenas ultricies mi.',
  },
  {
    name: 'Monument Record',
    color: '#B433F6',
    about:
      'Fermentum dui faucibus in ornare quam viverra orci sagittis. Nisl condimentum id venenatis a condimentum vitae sapien. In mollis nunc sed id semper risus in hendrerit. Cursus euismod quis viverra nibh cras pulvinar mattis nunc.',
  },
  {
    name: 'Control',
    color: '#1A1A1A',
    about:
      'At consectetur lorem donec massa sapien faucibus et molestie. Elit sed vulputate mi sit amet mauris commodo quis imperdiet. Purus gravida quis blandit turpis cursus in hac habitasse platea. Vitae elementum curabitur vitae nunc sed.',
  },
  {
    name: 'Calculated',
    color: '#F3AC3D',
    about:
      'Commodo viverra maecenas accumsan lacus vel facilisis volutpat est. Risus nullam eget felis eget nunc. Vitae turpis massa sed elementum. Sit amet nulla facilisi morbi tempus iaculis. Nulla porttitor massa id neque aliquam vestibulum.',
  },
  {
    name: 'Pending',
    color: '#1922E4',
    about:
      'Enim nec dui nunc mattis enim. Condimentum vitae sapien pellentesque habitant morbi tristique. Massa id neque aliquam vestibulum morbi blandit cursus risus. Ut placerat orci nulla pellentesque. Quis enim lobortis scelerisque fermentum dui faucibus in.',
  },
];
