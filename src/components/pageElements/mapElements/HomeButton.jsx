import Extent from '@arcgis/core/geometry/Extent';
import { HomeModernIcon } from '@heroicons/react/24/outline';
import { useFirebaseAnalytics } from '@ugrc/utah-design-system';
import { useMapReady } from '@ugrc/utilities/hooks';
import { useEffect, useRef } from 'react';

const goHome = async (view, extent) => {
  if (!(extent instanceof Extent)) {
    extent = new Extent(extent);
  }

  return await view.goTo(extent);
};

/**
 * @typedef {Object} HomeButtonProps
 * @property {Object} [view]
 * @property {number} [width]
 * @property {Object} extent
 */

/**
 * @type {React.FC<HomeButtonProps>}
 */
export default function HomeButton({ view, extent, width }) {
  const ready = useMapReady(view);
  const me = useRef();
  const logEvent = useFirebaseAnalytics();

  useEffect(() => {
    if (ready && me.current) {
      view?.ui?.add(me.current, width > 640 ? 'bottom-right' : 'top-left', 3);
    }
    const handle = me.current;

    return () => view?.ui?.remove(handle);
  }, [view, ready, width]);

  return (
    <div ref={me} className="relative flex h-8 w-8 rounded-full bg-white shadow-xs">
      <button
        className="flex flex-1 cursor-pointer items-center justify-center rounded-full bg-white"
        name="default view"
        aria-label="Default map view"
        title="Default map view"
        onClick={() => {
          goHome(view, extent);
          logEvent('map-home');
        }}
      >
        <HomeModernIcon className="h-5 w-5 text-slate-700" />
      </button>
    </div>
  );
}
