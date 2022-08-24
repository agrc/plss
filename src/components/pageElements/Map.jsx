import PropTypes from 'prop-types';
import LayerSelector from '@ugrc/layer-selector'; // eslint-disable-line import/no-unresolved
import esriConfig from '@arcgis/core/config';
import '@ugrc/layer-selector/src/LayerSelector.css';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { identify } from '@arcgis/core/rest/identify';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import { contrastColor } from 'contrast-color';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useViewLoading, useGraphicManager } from '@ugrc/utilities/hooks'; // eslint-disable-line import/no-unresolved
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { addFunctions } from '../../firebase/firebase.js';
import { useAuthState } from '../contexts/AuthContext.jsx';

// import Search from '../Search/Search';

esriConfig.assetsPath = '/assets';

const functions = addFunctions();
const myPoints = httpsCallable(functions, 'functions-httpsGetPoints');

const urls = {
  landownership:
    'https://gis.trustlands.utah.gov/server/' +
    '/rest/services/Ownership/UT_SITLA_Ownership_LandOwnership_WM/FeatureServer/0',
  parcels:
    'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahStatewideParcels/FeatureServer',
  plss: 'https://tiles.arcgis.com/tiles/99lidPhWCzftIe9K/arcgis/rest/services/UtahPLSS/VectorTileServer',
  points: 'https://mapserv.utah.gov/arcgis/rest/services/PLSS/MapServer',
};

const loadingCss =
  'z-[1] transition-all duration-700 ease-in-out absolute top-0 h-2 w-screen animate-gradient-x bg-gradient-to-r from-cyan-700/90 via-teal-100/90 to-purple-600/90';

export default function PlssMap({ state, dispatch, color }) {
  const { state: userState } = useAuthState();
  const node = useRef(null);
  const mapView = useRef();
  const [selectorOptions, setSelectorOptions] = useState();
  const navigate = useNavigate();
  const isLoading = useViewLoading(mapView.current);
  const [mapState, setMapState] = useState('idle');
  const { graphic, setGraphic } = useGraphicManager(mapView);
  const { setGraphic: setUserGraphics } = useGraphicManager(mapView);
  const { data: thePoints, status } = useQuery(['myPoints'], myPoints, {
    enabled: userState.state === 'SIGNED_IN',
  });

  // create map
  useEffect(() => {
    if (!node.current) {
      return;
    }

    const esriMap = new EsriMap({
      basemap: {},
    });

    mapView.current = new MapView({
      container: node.current,
      map: esriMap,
      extent: {
        xmax: -11762120.612131765,
        xmin: -13074391.513731329,
        ymax: 5225035.106177688,
        ymin: 4373832.359194187,
        spatialReference: 3857,
      },
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
          Factory: FeatureLayer,
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
          Factory: MapImageLayer,
          url: urls.points,
          id: 'PLSS Points',
          selected: true,
          minScale: 2000000,
        },
      ],
      position: 'top-right',
    });

    return () => {
      mapView.current.destroy();
      esriMap.destroy();
    };
  }, []);

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
                color: color.hex,
                size: '8px',
                outline: {
                  color: contrastColor.call({}, { bgColor: color.hex }),
                  width: 1,
                },
              },
            })
          );
          break;
        }
        default: {
          const parameters = new IdentifyParameters({
            returnGeometry: true,
            tolerance: 3,
            geometry: event.mapPoint,
            mapExtent: mapView.current.extent,
            layerIds: [0],
            layerOption: 'all',
            returnFieldName: true,
          });

          const response = await identify(
            'https://mapserv.utah.gov/arcgis/rest/services/PLSS/MapServer',
            parameters
          );

          let payload = null;
          if (response?.results?.length > 0) {
            payload = response.results[0].feature;
          }

          dispatch({ type: 'map/identify', payload });
          navigate('/identify');
        }
      }
    });

    return () => clickHandler?.remove();
  }, [state, dispatch, navigate, color, setGraphic]);

  // update graphic on color change
  useEffect(() => {
    if (!graphic) {
      return;
    }

    if (color.hex === '') {
      // hex reset on completion, remove the graphic
      setGraphic({});
    } else {
      setGraphic(
        new Graphic({
          geometry: graphic.geometry,
          symbol: {
            type: 'simple-marker',
            style: 'circle',
            color: color.hex,
            size: '8px',
            outline: {
              color: contrastColor.call({}, { bgColor: color.hex }),
              width: 1,
            },
          },
        })
      );
    }
  }, [setGraphic, color]); // eslint-disable-line react-hooks/exhaustive-deps
  // ignore graphic

  // add and remove points on login and logout
  useEffect(() => {
    setMapState(status);

    if (status === 'success') {
      setUserGraphics(thePoints.data);
      dispatch({ type: 'map/userPoints', payload: thePoints.data });
    }

    if (userState.state === 'SIGNED_OUT') {
      setUserGraphics();
      dispatch({ type: 'map/userPoints', payload: [] });
    }
  }, [dispatch, setUserGraphics, thePoints, status, userState.state]);

  return (
    <section className="ugrc__map">
      <div
        className={clsx(
          loadingCss,
          isLoading || mapState === 'loading' ? '' : 'opacity-0'
        )}
      ></div>
      <div ref={node} className="h-screen w-full bg-white">
        {selectorOptions ? (
          <LayerSelector {...selectorOptions}></LayerSelector>
        ) : null}
        {/* <Search view={mapView.current} /> */}
      </div>
    </section>
  );
}

PlssMap.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  color: PropTypes.object.isRequired,
};
