import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useMapReady, useOpenClosed } from '@ugrc/utilities/hooks';
import PropTypes from 'prop-types';
import { Fragment, useEffect, useRef } from 'react';
import { Button } from '../../formElements/Buttons.jsx';

export default function GroupButton({ view, width, children }) {
  const node = useRef();
  const ready = useMapReady(view);
  const [isOpen, { toggle }] = useOpenClosed();

  useEffect(() => {
    if (ready && node.current) {
      view?.ui?.add(node.current, width > 640 ? 'bottom-right' : 'top-left', 1);
    }
    const handle = node.current;

    return () => view?.ui?.remove(handle);
  }, [view, ready, width]);

  return (
    <>
      <div ref={node} className="relative flex h-8 w-8 rounded-full bg-white shadow-sm">
        <button
          name="open map finding tools"
          aria-label="open map finding tools"
          title="open map finding tools"
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            toggle();
          }}
          className="flex flex-1 cursor-pointer items-center justify-center rounded-full bg-white"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-700" />
        </button>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={toggle}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </TransitionChild>

          <div className="fixed left-0 right-0 top-2 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-2xl transform rounded-2xl bg-white p-4 text-left align-middle shadow-xl transition-all">
                  <div>{children}</div>

                  <div className="mt-4">
                    <Button type="button" style="secondary" onClick={toggle}>
                      Close
                    </Button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
GroupButton.displayName = 'GroupButton';
GroupButton.propTypes = {
  view: PropTypes.object,
  width: PropTypes.number,
  children: PropTypes.node,
};
