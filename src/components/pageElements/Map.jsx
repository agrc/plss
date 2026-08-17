import esriConfig from '@arcgis/core/config';
import Polygon from '@arcgis/core/geometry/Polygon';
import Polyline from '@arcgis/core/geometry/Polyline';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import EsriMap from '@arcgis/core/Map';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer.js';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import Viewpoint from '@arcgis/core/Viewpoint';
import '@arcgis/map-components/components/arcgis-map';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useWindowWidth } from '@react-hook/window-size';
import { useQuery } from '@tanstack/react-query';
import { LayerSelector } from '@ugrc/utah-design-system/components/LayerSelector';
import { useFirebaseAnalytics } from '@ugrc/utah-design-system/contexts/FirebaseAnalyticsProvider';
import { useFirebaseAuth } from '@ugrc/utah-design-system/contexts/FirebaseAuthProvider';
import { useFirebaseFunctions } from '@ugrc/utah-design-system/contexts/FirebaseFunctionsProvider';
import useGraphicManager from '@ugrc/utilities/hooks/useGraphicManager';
import useViewLoading from '@ugrc/utilities/hooks/useViewLoading';
import useViewPointZooming from '@ugrc/utilities/hooks/useViewPointZooming';
import { getUrlParameter, setUrlParameter } from '@ugrc/utilities/url';
import { clsx } from 'clsx';
import { contrastColor } from 'contrast-color';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import DefaultFallback from './ErrorBoundary.jsx';
import GroupButton from './mapElements/GroupButton.jsx';
import HomeButton from './mapElements/HomeButton.jsx';
import MonumentRecord from './mapElements/MonumentRecord.jsx';
import MyLocation from './mapElements/MyLocation.jsx';
import Township from './mapElements/Township.jsx';
import { normalizePointId } from './utils.js';

esriConfig.assetsPath = '/assets';

const urls = {
  landownership:
    'https://gis.trustlands.utah.gov/hosting/rest/services/Hosted/Land_Ownership_WM_VectorTile/VectorTileServer',
  parcels: 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahStatewideParcels/FeatureServer',
  plss: 'https://tiles.arcgis.com/tiles/99lidPhWCzftIe9K/arcgis/rest/services/UtahPLSS/VectorTileServer',
  points: 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/PLSS_Monuments/FeatureServer/0',
};

const loadingCss =
  'z-1 transition-all duration-700 ease-in-out absolute top-0 h-2 w-screen animate-gradient-x bg-linear-to-r from-cyan-700/90 via-teal-100/90 to-purple-600/90';

const white = [0, 0, 0, 255];
const outline = {
  color: white,
  width: 1.25,
};
const renderer = new UniqueValueRenderer({
  valueExpression: `
    if ($feature.control == 1) {
      if ($feature.mrrc == 1) {
        return 'control.mrrc';
      }
      if ($feature.monument == 1) {
        return 'control.monument';
      }

      if ($feature.primary_corner == 1) {
        return 'control';
      }

      return 'interior';
    }

    if ($feature.mrrc == 1) {
      return 'mrrc';
    }

    if ($feature.monument == 1) {
      if ($feature.mrrc == 1) {
        return 'mrrc';
      }
      return 'monument';
    }

    if ($feature.primary_corner == 1) {
      if ($feature.managed_by != null) {
        return 'county';
      }

      if (lower($feature.point_category) == 'calculated') {
        return 'calculated';
      }
    }

    return 'interior';
  `,
});

renderer.addUniqueValueInfo({
  value: 'mrrc',
  symbol: new SimpleMarkerSymbol({
    style: 'circle',
    color: [115, 178, 255, 255],
    size: 5,
    outline,
  }),
  label: 'mrrc',
});

renderer.addUniqueValueInfo({
  value: 'monument',
  symbol: new SimpleMarkerSymbol({
    style: 'circle',
    color: [197, 0, 255, 255],
    size: 5,
    outline,
  }),
  label: 'monument',
});

renderer.addUniqueValueInfo({
  value: 'county',
  symbol: new SimpleMarkerSymbol({
    style: 'circle',
    color: [76, 230, 0, 255],
    size: 5,
    outline,
  }),
  label: 'county',
});

renderer.addUniqueValueInfo({
  value: 'calculated',
  symbol: new SimpleMarkerSymbol({
    style: 'circle',
    color: [255, 170, 0, 255],
    size: 5,
    outline,
  }),
  label: 'calculated',
});

renderer.addUniqueValueInfo({
  value: 'interior',
  symbol: new SimpleMarkerSymbol({
    style: 'circle',
    color: [255, 255, 255, 255],
    size: 3,
    outline: {
      color: white,
      width: 1,
    },
  }),
  label: 'interior',
});

renderer.addUniqueValueInfo({
  value: 'control.monument',
  symbol: new PictureMarkerSymbol({
    url: 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABIAAAAPCAYAAADphp8SAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA3klEQVQ4ja2SwQ2CMBiFvwMjeIEJvHNkBYk7eMANuMrZDXSNOoIcGYAFdA3zmtaUigHEl5DQln7533sk/EnJjG9yIAPMWlDjYKtAFbAL3q9rQF6XX0GVs0QEO7IAlLts2FOxIeOOoafz9rq5IF1IzxgKF9GBEy03akrjWpwEaZpKk3iIl9YFZdpiPoIfA1lLsjOmLTktppkCvetWJrITS/uyHf8OISgL6+7pbCZFYE9r7TsNpgpBujGou6ZUJtaOay081lSC2Sg8SNNo4xlbaTH2+SI50GHnQY+xSpfoBa1oOO/atOKEAAAAAElFTkSuQmCC',
    width: 13,
    height: 11,
  }),
  label: 'control.monument',
});

renderer.addUniqueValueInfo({
  value: 'control.mrrc',
  symbol: new PictureMarkerSymbol({
    url: 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABIAAAAPCAYAAADphp8SAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA6ElEQVQ4ja2SMQ6CQBREp6C0sjFQorUNofAENlJYeoH1FEYSTqGXoFhvQfYGYKnhFmZw1yy4CSBOxX7Yl5n5ePiTvAHfRAACAHIqKNWwSSABYGc9X6eAjC6/goSOhA7siBGgSHeD9VZgNg9QFRJ1qUw8NRTEC/7+JBHG74o2hzPuxQ15lki9xV4Q3Qg6MRAjnpdx4leF/CreBWoiMY5Li1XEmGkf6LNudsI4XXHO2N3fwQYF9rrrUjWdhFY8njnXarmyQbzRWneeJezExLEhxhVhTRUGRDccPF1RdByXmIAvlQE9XCsdoxf4ukmzZBHoCQAAAABJRU5ErkJggg==',
    width: 13,
    height: 11,
  }),
  label: 'control.mrrc',
});

renderer.addUniqueValueInfo({
  value: 'control',
  symbol: new PictureMarkerSymbol({
    url: 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAABIAAAAPCAYAAADphp8SAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAmElEQVQ4ja2SwQ2AIBRDe3AJWQPHcA5cwzVwDedwDV3D1EBCGlQQeyJ8eGkLHX5SV3DGAjAA1lbQHGBNIAdgTNZLCyjKfwW5EAkCm1ABsqEbVYy3lYJ4ob+ZeQBDCchKN7m5VVc5UC6Sag1/6xaUPveTev0OKci8RIKIzrMgOtHnfnNF2FVFBNENN44KEMUE7GuLoF3Lq9UJVc0X0ImC7HcAAAAASUVORK5CYII=',
    width: 13,
    height: 11,
  }),
  label: 'control',
});

const extent = {
  type: 'extent',
  xmax: -11762120.612131765,
  xmin: -13074391.513731329,
  ymax: 5225035.106177688,
  ymin: 4373832.359194187,
  spatialReference: 3857,
};

const tabs = ['Section Finder', 'Monument Finder'];
const level14 = 72223;
const plssPointsLayerId = 'PLSS Points';

/**
 * @typedef {Object} PlssMapProps
 * @property {string} color
 * @property {function} dispatch
 * @property {boolean} drawerOpen
 * @property {Object} state
 */

/**
 * @type {React.FC<PlssMapProps>}
 */
export default function PlssMap({ color, dispatch, drawerOpen, state }) {
  const node = useRef(null);
  const pointFromUrlLoaded = useRef(false);
  const [selectorOptions, setSelectorOptions] = useState();
  const [mapState, setMapState] = useState('idle');
  const [view, setView] = useState();
  const onlyWidth = useWindowWidth();

  const { currentUser } = useFirebaseAuth();
  const logEvent = useFirebaseAnalytics();

  const isLoading = useViewLoading(view);
  const { graphic, setGraphic } = useGraphicManager(view);
  const { setGraphic: setUserGraphics } = useGraphicManager(view);
  const { setGraphic: setGpsGraphic } = useGraphicManager(view);
  const { setViewPoint } = useViewPointZooming(view);

  const { functions } = useFirebaseFunctions();
  const myContent = httpsCallable(functions, 'getMyContent');

  const { data: content, status } = useQuery({
    queryKey: ['my content'],
    queryFn: myContent,
    enabled: currentUser !== undefined,
    staleTime: Infinity,
  });

  const { graphic: identifyGraphic, gps: gpsGraphic } = state;

  // create map
  useEffect(() => {
    if (!node.current) {
      return;
    }

    const mapElement = node.current;
    mapElement.map = new EsriMap();
    mapElement.extent = extent;
    setSelectorOptions({
      quadWord: import.meta.env.VITE_DISCOVER_KEY,
      basemaps: ['Hybrid', 'Lite', 'Terrain', 'Topo', 'Color IR', 'High Contrast'],
      operationalLayers: [
        'Address Points',
        {
          label: 'Land Ownership',
          function: () => {
            return new VectorTileLayer({
              url: urls.landownership,
              opacity: 0.3,
            });
          },
        },
        {
          label: 'Parcels',
          function: () => {
            return new FeatureLayer({
              url: urls.parcels,
              opacity: 0.5,
              minScale: 55000,
            });
          },
        },
        {
          label: 'PLSS',
          defaultSelected: true,
          function: () => {
            return new VectorTileLayer({
              url: urls.plss,
              opacity: 0.5,
              minScale: 2000000,
            });
          },
        },
        {
          label: plssPointsLayerId,
          defaultSelected: true,
          function: () => {
            return new FeatureLayer({
              id: plssPointsLayerId,
              url: urls.points,
              outFields: [
                'point_id',
                'plss_id',
                'label',
                'control',
                'longitude',
                'latitude',
                'county',
                'elevation',
                'steward',
                'steward_second',
                'managed_by',
                'mrrc',
                'monument',
                'point_category',
              ],
              renderer,
              labelingInfo: [
                {
                  labelPlacement: 'above-right',
                  minScale: 20000,
                  labelExpressionInfo: {
                    expression: '$feature.point_id',
                  },
                  where: 'primary_corner=1 or mrrc=1 or monument=1',
                  font: {
                    family: 'Helvetica',
                    size: 14,
                    weight: 'bold',
                  },
                  symbol: {
                    type: 'text',
                    color: '#1e293b',
                    haloColor: [255, 255, 255, 0.8],
                    haloSize: 3,
                  },
                },
              ],
              minScale: level14 + 10000,
            });
          },
        },
      ],
    });

    let cancelled = false;

    void mapElement.viewOnReady().then(() => {
      if (cancelled) {
        return;
      }

      const mapView = mapElement.view;
      mapView.ui.components = ['zoom'];
      setView(mapView);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // move zoom widget to bottom right on larger screens
  useEffect(() => {
    if (view && onlyWidth > 640) {
      view.ui.move(['zoom'], 'bottom-right', 0);
    }
  }, [onlyWidth, view]);

  // set view padding depending on screen size
  useEffect(() => {
    if (!onlyWidth) {
      return;
    }

    if (view) {
      if (onlyWidth > 640) {
        view.padding = { left: drawerOpen ? 400 : 0, bottom: 0 };
      } else {
        view.padding = { bottom: drawerOpen ? 580 : 70, left: 0 };
      }
    }
  }, [onlyWidth, drawerOpen, view]);

  // manage highlighted graphic
  useEffect(() => {
    if (!view?.ready) {
      return;
    }

    const plssPoints = view.map.findLayerById(plssPointsLayerId);

    if (!identifyGraphic) {
      if (plssPoints) {
        plssPoints.featureEffect = null;
      }

      return;
    }

    view.goTo(
      new Viewpoint({
        targetGeometry: identifyGraphic.geometry,
        scale: 4500,
      }),
      { duration: 1000 },
    );

    if (plssPoints) {
      plssPoints.featureEffect = {
        filter: {
          objectIds: [identifyGraphic.attributes.OBJECTID],
        },
        includedEffect: 'drop-shadow(0px 0px 10px white) saturate(200%) brightness(400%) opacity(100%)',
        excludedEffect: 'grayscale(70%) opacity(70%) invert(10%)',
      };
    }
  }, [identifyGraphic, view]);

  // handle clicks
  useEffect(() => {
    if (!view) {
      return;
    }

    const clickHandler = view.on('click', async (event) => {
      switch (state.activeTool) {
        case 'add-point': {
          const point = { ...event.mapPoint.toJSON(), type: 'point' };
          dispatch({ type: 'add-point/click', payload: point });
          setGraphic(
            new Graphic({
              geometry: point,
              symbol: {
                type: 'simple-marker',
                style: 'circle',
                color: color,
                size: '8px',
                outline: {
                  color: contrastColor.call({}, { bgColor: color }),
                  width: 1,
                },
              },
            }),
          );
          logEvent('my-points-set');
          break;
        }
        default: {
          const response = await view.hitTest(event);

          const hits = response?.results?.filter((result) => result.layer?.id === plssPointsLayerId);

          let payload = null;
          if (hits.length > 0) {
            payload = hits[0].graphic;
          } else {
            if (view.scale > level14 + 1) {
              view.goTo(
                new Viewpoint({
                  targetGeometry: event.mapPoint,
                  scale: level14,
                }),
                { duration: 1000 },
              );
            }
          }

          logEvent('identify', {
            hits: hits.length,
            scale: view.scale,
          });

          setUrlParameter('POINT_ID', payload?.attributes?.point_id ?? null);
          dispatch({ type: 'map/identify', payload });
          dispatch({ type: 'menu/toggle', payload: 'identify' });
        }
      }
    });

    return () => clickHandler?.remove();
  }, [state, dispatch, color, setGraphic, logEvent, view]);

  useEffect(() => {
    const pointId = normalizePointId(getUrlParameter('POINT_ID', 'string'));

    if (!view || pointFromUrlLoaded.current || pointId.length < 1) {
      return;
    }

    pointFromUrlLoaded.current = true;

    let cancelled = false;

    const identifyPointFromUrl = async () => {
      await view.when();

      if (cancelled) {
        return;
      }

      let features;

      try {
        const pointLayer =
          view.map.findLayerById(plssPointsLayerId) ??
          new FeatureLayer({
            url: urls.points,
          });

        const response = await pointLayer.queryFeatures({
          where: `point_id='${pointId}'`,
          outFields: ['*'],
          returnGeometry: true,
        });

        features = response?.features ?? [];
      } catch (error) {
        console.error('Error querying POINT_ID from URL', error);
        features = [];
      }

      if (cancelled) {
        return;
      }

      const payload = features.length === 1 ? features[0] : null;

      if (features.length > 1) {
        console.warn(`Multiple PLSS points matched POINT_ID=${pointId}`);
      }

      logEvent('identify', {
        hits: features.length,
        scale: view.scale,
        source: 'url',
      });

      if (cancelled) {
        return;
      }

      dispatch({ type: 'map/identify', payload });
      dispatch({ type: 'menu/toggle', payload: 'identify' });
    };

    void identifyPointFromUrl();

    return () => {
      cancelled = true;
    };
  }, [dispatch, logEvent, view]);

  // update graphic on color change
  useEffect(() => {
    if (!graphic) {
      return;
    }

    logEvent('my-points-color-change', {
      color: color,
    });

    if (color === '') {
      // hex reset on completion, remove the graphic
      setGraphic();
    } else {
      setGraphic(
        new Graphic({
          geometry: graphic.geometry,
          symbol: {
            type: 'simple-marker',
            style: 'circle',
            color: color,
            size: '8px',
            outline: {
              color: contrastColor.call({}, { bgColor: color }),
              width: 1,
            },
          },
        }),
      );
    }
  }, [setGraphic, color, logEvent]); // eslint-disable-line react-hooks/exhaustive-deps
  // ignore graphic

  // add and remove points on login and logout
  useEffect(() => {
    setMapState(status);
    const points = [];

    if (currentUser !== undefined && status === 'success') {
      for (const point of content?.data?.points ?? []) {
        points.push(
          new Graphic({
            geometry: point.geometry,
            symbol: point.symbol,
          }),
        );
      }

      if (points.length > 0) {
        setUserGraphics(points);
        dispatch({ type: 'map/userPoints', payload: points });
      }
    }

    if (currentUser === undefined) {
      setUserGraphics();
      dispatch({ type: 'map/userPoints', payload: [] });
    }
  }, [dispatch, setUserGraphics, content?.data?.points, status, currentUser, view]);

  // add and zoom to gps location
  useEffect(() => {
    if (!gpsGraphic) {
      return;
    }

    logEvent('gps-on');

    view?.when(async () => {
      await view.goTo(
        new Viewpoint({
          targetGeometry: gpsGraphic.graphic.geometry,
          scale: gpsGraphic.scale ?? view.scale,
        }),
        { duration: 1000 },
      );

      setGpsGraphic(gpsGraphic.graphic);
    });
  }, [gpsGraphic, setGpsGraphic, logEvent, view]);

  // zoom to the center state object
  useEffect(() => {
    if (state.center) {
      let targetGeometry = state.center.geometry;

      logEvent('zooming', {
        type: state.center.geometry?.type,
      });

      switch (state.center.geometry?.type) {
        case 'polygon':
          targetGeometry = new Polygon(state.center.geometry).extent.center;
          break;
        case 'polyline':
          targetGeometry = new Polyline(state.center.geometry).extent.center;
          break;
        default:
          break;
      }

      if (!targetGeometry) {
        return;
      }

      const vp = new Viewpoint({
        targetGeometry,
        scale: state.center.scale,
      });

      setViewPoint(vp);
    }
  }, [state.center, setViewPoint, logEvent, view]);

  return (
    <ErrorBoundary FallbackComponent={DefaultFallback}>
      <>
        <section className="ugrc__map">
          <div className={clsx(loadingCss, isLoading || mapState === 'loading' ? '' : 'opacity-0')}></div>
          <arcgis-map ref={node} className="h-screen w-full bg-white">
            {selectorOptions ? <LayerSelector {...selectorOptions} slot="top-right" /> : null}
            {view ? (
              <div
                slot={onlyWidth > 640 ? 'bottom-right' : 'top-left'}
                className="mt-18 flex flex-col gap-1 sm:mt-0 sm:mr-10 sm:flex-row"
              >
                <GroupButton>
                  <section className="mx-auto grid max-w-prose gap-2 text-sky-900">
                    <h2 className="mb-2 text-2xl font-bold">Quick finder tools</h2>
                    <TabGroup>
                      <TabList className="mb-3 flex space-x-1 rounded-xl bg-sky-500/20 p-1">
                        {tabs.map((item) => (
                          <Tab
                            key={item}
                            className={({ selected }) =>
                              clsx(
                                'w-full rounded-lg py-2.5 leading-5 font-medium',
                                'ring-white/60 ring-offset-2 ring-offset-sky-400 focus:ring-2 focus:outline-hidden',
                                selected
                                  ? 'border border-sky-600 bg-sky-500 text-white shadow-sm hover:border-sky-700 hover:bg-sky-600 focus:border-sky-500 focus:ring-sky-600 active:bg-sky-700'
                                  : 'text-sky-700 hover:bg-sky-600/20',
                              )
                            }
                          >
                            {item}
                          </Tab>
                        ))}
                      </TabList>
                      <TabPanels className="mx-4">
                        <TabPanel>
                          <Township dispatch={dispatch} apiKey={import.meta.env.VITE_API_KEY} />
                        </TabPanel>
                        <TabPanel>
                          <MonumentRecord dispatch={dispatch} />
                        </TabPanel>
                      </TabPanels>
                    </TabGroup>
                  </section>
                </GroupButton>
                <MyLocation dispatch={dispatch} />
                <HomeButton view={view} extent={extent} />
              </div>
            ) : null}
          </arcgis-map>
        </section>
      </>
    </ErrorBoundary>
  );
}
