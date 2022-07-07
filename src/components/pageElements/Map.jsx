import PropTypes from 'prop-types';
import LayerSelector from '@ugrc/layer-selector';
import Basemap from '@arcgis/core/Basemap';
import esriConfig from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import LOD from '@arcgis/core/layers/support/LOD';
import TileInfo from '@arcgis/core/layers/support/TileInfo';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { contrastColor } from 'contrast-color';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useViewLoading, useGraphicManager } from '@ugrc/utilities/hooks'; // eslint-disable-line import/no-unresolved
import clsx from 'clsx';
import { useQuery } from 'react-query';
import { httpsCallable } from 'firebase/functions';
import { addFunctions } from '../../firebase/firebase.js';
import { useAuthState } from '../contexts/AuthContext.jsx';

// import Search from '../Search/Search';

esriConfig.assetsPath = '/assets';

const functions = addFunctions();
const myPoints = httpsCallable(functions, 'getMyPoints');

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
  'z-10 transition-all duration-700 ease-in-out absolute top-0 h-2 w-screen animate-gradient-x bg-gradient-to-r from-cyan-700 via-teal-100 to-purple-600';

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
      ],
      modules: { LOD, TileInfo, Basemap, WebTileLayer, FeatureLayer },
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
    const clickHandler = mapView.current.on('click', (event) => {
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
          const graphic = {
            features: [
              {
                geometry: {
                  x: 39.9038,
                  y: -112.1379,
                },
                attributes: {
                  OBJECTID: '836687',
                  Shape: 'Point',
                  'Corner Point Label': '100540',
                  'Corner Point Identifier': 'UT260020S0010W0_100540',
                  'PLSS Area Identification': 'UT260020S0010W0',
                  'X or East Coordinate': '-111.890539',
                  'Y or North Coordinate': '40.660419',
                  'Z or Height Coordinate': 'Null',
                  'Average Township Elevation': '1426',
                  'Horizontal Datum': 'Null',
                  'Vertical Datum': ' ',
                  'Data Steward': 'UGRC - State of Utah',
                  'Second Data Steward': '',
                  'First PLSS Point Alternate Name': '',
                  'Second PLSS Point Alternate Name': '',
                  'Third PLSS Point Alternate Name': '',
                  'Fourth PLSS Point Alternate Name': '',
                  'Coordinate Reliability': ' Feet',
                  'Coordinate Computation Procedure': 'Null',
                  'Coordinate System': 'Geographic',
                  'Coordinate Collection Method': 'Null',
                  'Revised Date': '11/24/2017 8:18:10 PM',
                  'Error in X': 'Null',
                  'Error in Y': 'Null',
                  ERRORZ: 'Null',
                  Coord_Source: 'Null',
                  TieSheet_Name: 'SALT LAKE',
                  DISPLAY_GRP: 'Zoomed in',
                  Point_Category: 'Calculated',
                  isMonument: 'no',
                  isControl: 'no',
                  LONG_NAD83: '-111.89130785706529',
                  LAT_NAD83: '40.66036623589644',
                  County: 'SALT LAKE',
                },
              },
            ],
          };

          console.log('map view click');
          dispatch({ type: 'map/identify', payload: graphic.features[0] });
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
      ;
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
