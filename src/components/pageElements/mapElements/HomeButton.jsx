import Extent from '@arcgis/core/geometry/Extent';
import { HomeModernIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-unresolved
import { useMapReady } from '@ugrc/utilities/hooks';
import { logEvent } from 'firebase/analytics';
import { useAnalytics } from 'reactfire';

const goHome = async (view, extent) => {
  if (!(extent instanceof Extent)) {
    extent = new Extent(extent);
  }

  return await view.goTo(extent);
};

export default function HomeButton({ view, extent, width }) {
  const ready = useMapReady(view);
  const me = useRef();
  const analytics = useAnalytics();

  useEffect(() => {
    if (ready && me.current) {
      view?.ui?.add(me.current, width > 640 ? 'bottom-right' : 'top-left', 3);
    }
    const handle = me.current;

    () => view?.ui?.remove(handle);
  }, [view, ready, width]);

  return (
    <div
      ref={me}
      className="relative flex h-8 w-8 rounded-full bg-white shadow-sm"
    >
      <button
        className="flex flex-1 cursor-pointer items-center justify-center rounded-full bg-white"
        name="default view"
        aria-label="Default map view"
        title="Default map view"
        onClick={() => {
          goHome(view, extent);
          logEvent(analytics, 'map-home');
        }}
      >
        <HomeModernIcon className="h-5 w-5 text-slate-700" />
      </button>
    </div>
  );
}

HomeButton.propTypes = {
  view: PropTypes.object,
  width: PropTypes.number,
  extent: PropTypes.object.isRequired,
};
