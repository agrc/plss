import Extent from '@arcgis/core/geometry/Extent';
import { HomeModernIcon } from '@heroicons/react/24/outline';
import { useFirebaseAnalytics } from '@ugrc/utah-design-system/contexts/FirebaseAnalyticsProvider';

const goHome = async (view, extent) => {
  if (!(extent instanceof Extent)) {
    extent = new Extent(extent);
  }

  return await view.goTo(extent);
};

/**
 * @typedef {Object} HomeButtonProps
 * @property {Object} [view]
 * @property {Object} extent
 */

/**
 * @type {React.FC<HomeButtonProps>}
 */
export default function HomeButton({ view, extent }) {
  const logEvent = useFirebaseAnalytics();

  return (
    <div className="relative flex h-8 w-8 rounded-full bg-white shadow-xs">
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
