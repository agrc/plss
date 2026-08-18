import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import useOpenClosed from '@ugrc/utilities/hooks/useOpenClosed';
import { Fragment } from 'react';
import { Button } from '../../formElements/Buttons.tsx';

/**
 * @typedef {Object} GroupButtonProps
 * @property {React.ReactNode} [children]
 */

/**
 * @type {React.FC<GroupButtonProps>}
 */
export default function GroupButton({ children }) {
  const [isOpen, { toggle }] = useOpenClosed();

  return (
    <>
      <div className="relative flex h-8 w-8 rounded-full bg-white shadow-xs">
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
            <div className="fixed inset-0 bg-black/25" />
          </TransitionChild>

          <div className="fixed top-2 right-0 left-0 overflow-y-auto">
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
