import esriConfig from '@arcgis/core/config';
import Polygon from '@arcgis/core/geometry/Polygon';
import Polyline from '@arcgis/core/geometry/Polyline';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import EsriMap from '@arcgis/core/Map';
import Viewpoint from '@arcgis/core/Viewpoint';
import MapView from '@arcgis/core/views/MapView';
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer.js';
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol.js';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol.js';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { useWindowWidth } from '@react-hook/window-size';
import { useQuery } from '@tanstack/react-query';
import LayerSelector from '@ugrc/layer-selector';
import '@ugrc/layer-selector/src/LayerSelector.css';
import {
  useGraphicManager,
  useViewLoading,
  useViewPointZooming,
} from '@ugrc/utilities/hooks';
import clsx from 'clsx';
import { contrastColor } from 'contrast-color';
import { logEvent } from 'firebase/analytics';
import { httpsCallable } from 'firebase/functions';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useAnalytics, useFunctions, useSigninCheck } from 'reactfire';
import GroupButton from './mapElements/GroupButton.jsx';
import MonumentRecord from './mapElements/MonumentRecord.jsx';
import MyLocation from './mapElements/MyLocation.jsx';
import HomeButton from './mapElements/HomeButton.jsx';
import Township from './mapElements/Township.jsx';
import DefaultFallback from './ErrorBoundary.jsx';

esriConfig.assetsPath = '/assets';

const urls = {
  landownership:
    'https://gis.trustlands.utah.gov/hosting/rest/services/Hosted/Land_Ownership_WM_VectorTile/VectorTileServer',
  parcels:
    'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahStatewideParcels/FeatureServer',
  plss: 'https://tiles.arcgis.com/tiles/99lidPhWCzftIe9K/arcgis/rest/services/UtahPLSS/VectorTileServer',
  points:
    'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/PLSS_Monuments/FeatureServer/0',
};

const loadingCss =
  'z-[1] transition-all duration-700 ease-in-out absolute top-0 h-2 w-screen animate-gradient-x bg-gradient-to-r from-cyan-700/90 via-teal-100/90 to-purple-600/90';

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
export default function PlssMap({ color, dispatch, drawerOpen, state }) {
  const node = useRef(null);
  const mapView = useRef();
  const [selectorOptions, setSelectorOptions] = useState();
  const [mapState, setMapState] = useState('idle');
  const onlyWidth = useWindowWidth();

  const { data: signInCheckResult } = useSigninCheck();
  const analytics = useAnalytics();

  const isLoading = useViewLoading(mapView.current);
  const { graphic, setGraphic } = useGraphicManager(mapView.current);
  const { setGraphic: setUserGraphics } = useGraphicManager(mapView.current);
  const { setGraphic: setGpsGraphic } = useGraphicManager(mapView.current);
  const { setViewPoint } = useViewPointZooming(mapView.current);

  const functions = useFunctions();
  const myContent = httpsCallable(functions, 'getMyContent');

  const { data: content, status } = useQuery({
    queryKey: ['my content'],
    queryFn: myContent,
    enabled: signInCheckResult?.signedIn === true,
    staleTime: Infinity,
  });

  const { graphic: identifyGraphic, gps: gpsGraphic } = state;

  // create map
  useEffect(() => {
    if (!node.current) {
      return;
    }

    const esriMap = new EsriMap();

    mapView.current = new MapView({
      container: node.current,
      map: esriMap,
      extent,
      ui: {
        components: ['zoom'],
      },
    });

    setSelectorOptions({
      view: mapView.current,
      quadWord: import.meta.env.VITE_DISCOVER_KEY,
      baseLayers: ['Hybrid', 'Lite', 'Terrain', 'Topo', 'Color IR'],
      overlays: [
        'Address Points',
        {
          Factory: VectorTileLayer,
          url: urls.landownership,
          id: 'Land Ownership',
          opacity: 0.3,
        },
        {
          Factory: FeatureLayer,
          url: urls.parcels,
          id: 'Parcels',
          opacity: 0.5,
          minScale: 55000,
        },
        {
          Factory: VectorTileLayer,
          url: urls.plss,
          id: 'PLSS',
          opacity: 0.5,
          selected: true,
          minScale: 2000000,
        },
        {
          Factory: FeatureLayer,
          url: urls.points,
          id: 'PLSS Points',
          selected: true,
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
            'control',
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
        },
      ],
      position: 'top-right',
    });

    return () => {
      mapView.current.destroy();
      esriMap.destroy();
    };
  }, []);

  // move zoom widget to bottom right on larger screens
  useEffect(() => {
    mapView.current.when(() => {
      if (onlyWidth > 640) {
        mapView.current.ui.move(['zoom'], 'bottom-right', 0);
      }
    });
  }, [onlyWidth]);

  // set view padding depending on screen size
  useEffect(() => {
    if (!onlyWidth) {
      return;
    }

    if (mapView.current) {
      if (onlyWidth > 640) {
        mapView.current.padding = { left: drawerOpen ? 400 : 0, bottom: 0 };
      } else {
        mapView.current.padding = { bottom: drawerOpen ? 580 : 70, left: 0 };
      }
    }
  }, [onlyWidth, drawerOpen]);

  // manage highlighted graphic
  useEffect(() => {
    if (!mapView.current.ready) {
      return;
    }

    if (!identifyGraphic) {
      const plssPoints = mapView.current.map.findLayerById('PLSS Points');
      plssPoints.featureEffect = null;

      return;
    }

    mapView.current.goTo(
      new Viewpoint({
        targetGeometry: identifyGraphic.geometry,
        scale: 4500,
      }),
      { duration: 1000 },
    );

    identifyGraphic.layer.featureEffect = {
      filter: {
        objectIds: [identifyGraphic.attributes.OBJECTID],
      },
      includedEffect:
        'drop-shadow(0px 0px 10px white) saturate(200%) brightness(400%) opacity(100%)',
      excludedEffect: 'grayscale(70%) opacity(70%) invert(10%)',
    };
  }, [identifyGraphic]);

  // handle clicks
  useEffect(() => {
    if (!mapView.current) {
      return;
    }

    const clickHandler = mapView.current.on('click', async (event) => {
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
          logEvent(analytics, 'my-points-set');
          break;
        }
        default: {
          const response = await mapView.current.hitTest(event);

          const hits = response?.results?.filter(
            (result) => result.layer?.id === 'PLSS Points',
          );

          let payload = null;
          if (hits.length > 0) {
            payload = hits[0].graphic;
          } else {
            if (mapView.current.scale > level14 + 1) {
              mapView.current.goTo(
                new Viewpoint({
                  targetGeometry: event.mapPoint,
                  scale: level14,
                }),
                { duration: 1000 },
              );
            }
          }

          logEvent(analytics, 'identify', {
            hits: hits.length,
            scale: mapView.current.scale,
          });

          dispatch({ type: 'map/identify', payload });
          dispatch({ type: 'menu/toggle', payload: 'identify' });
        }
      }
    });

    return () => clickHandler?.remove();
  }, [state, dispatch, color, setGraphic, analytics]);

  // update graphic on color change
  useEffect(() => {
    if (!graphic) {
      return;
    }

    logEvent(analytics, 'my-points-color-change', {
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
  }, [setGraphic, color, analytics]); // eslint-disable-line react-hooks/exhaustive-deps
  // ignore graphic

  // add and remove points on login and logout
  useEffect(() => {
    setMapState(status);
    const points = [];

    if (signInCheckResult?.signedIn === true && status === 'success') {
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

    if (signInCheckResult?.signedIn === false) {
      setUserGraphics();
      dispatch({ type: 'map/userPoints', payload: [] });
    }
  }, [
    dispatch,
    setUserGraphics,
    content?.data?.points,
    status,
    signInCheckResult?.signedIn,
  ]);

  // add and zoom to gps location
  useEffect(() => {
    if (!gpsGraphic) {
      return;
    }

    logEvent(analytics, 'gps-on');

    mapView.current.when(async () => {
      await mapView.current.goTo(
        new Viewpoint({
          targetGeometry: gpsGraphic.graphic.geometry,
          scale: gpsGraphic.scale ?? mapView.current.scale,
        }),
        { duration: 1000 },
      );

      setGpsGraphic(gpsGraphic.graphic);
    });
  }, [gpsGraphic, setGpsGraphic, analytics]);

  // zoom to the center state object
  useEffect(() => {
    if (state.center) {
      let targetGeometry = state.center.geometry;

      logEvent(analytics, 'zooming', {
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
  }, [state.center, setViewPoint, analytics]);

  return (
    <ErrorBoundary FallbackComponent={DefaultFallback}>
      <>
        <section className="ugrc__map">
          <div
            className={clsx(
              loadingCss,
              isLoading || mapState === 'loading' ? '' : 'opacity-0',
            )}
          ></div>
          <div ref={node} className="h-screen w-full bg-white"></div>
        </section>
        {selectorOptions ? (
          <LayerSelector {...selectorOptions}></LayerSelector>
        ) : null}
        <HomeButton view={mapView.current} extent={extent} width={onlyWidth} />
        <MyLocation
          view={mapView.current}
          dispatch={dispatch}
          width={onlyWidth}
        />
        <GroupButton view={mapView.current} width={onlyWidth}>
          <section className="mx-auto grid max-w-prose gap-2 text-sky-900">
            <h2 className="mb-2 text-2xl font-bold">Quick finder tools</h2>
            <TabGroup>
              <TabList className="mb-3 flex space-x-1 rounded-xl bg-sky-500/20 p-1">
                {tabs.map((item) => (
                  <Tab
                    key={item}
                    className={({ selected }) =>
                      clsx(
                        'w-full rounded-lg py-2.5 font-medium leading-5',
                        'ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-400 focus:outline-none focus:ring-2',
                        selected
                          ? 'border border-sky-600 bg-sky-500 text-white shadow hover:border-sky-700 hover:bg-sky-600 focus:border-sky-500 focus:ring-sky-600 active:bg-sky-700'
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
                  <Township
                    dispatch={dispatch}
                    apiKey={import.meta.env.VITE_API_KEY}
                  />
                </TabPanel>
                <TabPanel>
                  <MonumentRecord dispatch={dispatch} />
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </section>
        </GroupButton>
      </>
    </ErrorBoundary>
  );
}

PlssMap.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  drawerOpen: PropTypes.bool.isRequired,
};
