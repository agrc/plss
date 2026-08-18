import Extent from '@arcgis/core/geometry/Extent';
import MapView from '@arcgis/core/views/MapView';
import { HomeModernIcon } from '@heroicons/react/24/outline';
import { useFirebaseAnalytics } from '@ugrc/utah-design-system/contexts/FirebaseAnalyticsProvider';

type HomeExtent = ConstructorParameters<typeof Extent>[0] | Extent;

const goHome = async (view: MapView, extent: HomeExtent): Promise<void> => {
  const target = extent instanceof Extent ? extent : new Extent(extent);

  await view.goTo(target);
};

type HomeButtonProps = {
  extent: HomeExtent;
  view?: MapView;
};

export default function HomeButton({ view, extent }: HomeButtonProps) {
  const logEvent = useFirebaseAnalytics();

  return (
    <div className="relative flex h-8 w-8 rounded-full bg-white shadow-xs">
      <button
        className="flex flex-1 cursor-pointer items-center justify-center rounded-full bg-white"
        name="default view"
        aria-label="Default map view"
        title="Default map view"
        onClick={() => {
          if (view) {
            void goHome(view, extent);
          }
          logEvent('map-home');
        }}
      >
        <HomeModernIcon className="h-5 w-5 text-slate-700" />
      </button>
    </div>
  );
}
