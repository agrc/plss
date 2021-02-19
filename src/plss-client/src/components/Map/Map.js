import LayerSelector from '@agrc/layer-selector';
import Basemap from '@arcgis/core/Basemap';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import LOD from '@arcgis/core/layers/support/LOD';
import TileInfo from '@arcgis/core/layers/support/TileInfo';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { contrastColor } from 'contrast-color';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

const urls = {
  landownership:
    'https://gis.trustlands.utah.gov/server/' +
    '/rest/services/Ownership/UT_SITLA_Ownership_LandOwnership_WM/FeatureServer/0',
};

export default function PlssMap({ state, dispatch, color }) {
  const node = React.useRef(null);
  const mapView = React.useRef();
  const [selectorOptions, setSelectorOptions] = React.useState();
  const history = useHistory();

  // create map
  React.useEffect(() => {
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
      quadWord: process.env.REACT_APP_DISCOVER,
      baseLayers: ['Hybrid', 'Lite', 'Terrain', 'Topo', 'Color IR'],
      overlays: [
        'Address Points',
        {
          Factory: FeatureLayer,
          url: urls.landownership,
          id: 'Land Ownership',
          opacity: 0.3,
        },
      ],
      modules: { LOD, TileInfo, Basemap, WebTileLayer, FeatureLayer },
      position: 'top-right',
    });
  }, []);

  // handle clicks
  React.useEffect(() => {
    if (!mapView.current) {
      return;
    }

    const clickHandler = mapView.current.on('click', (event) => {
      switch (state.activeTool) {
        case 'add-point': {
          const { x, y } = event.mapPoint;
          dispatch({ type: 'add-point/click', payload: { x, y } });
          mapView.current.graphics.add(
            new Graphic({
              geometry: {
                type: 'point',
                x,
                y,
                spatialReference: {
                  wkid: 3857,
                },
              },
              symbol: {
                type: 'simple-marker',
                style: 'circle',
                color: color.hex,
                size: '8px',
                outline: {
                  color: contrastColor({ bgColor: color.hex }),
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
                  'Data Steward': 'AGRC - State of Utah',
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
          history.push('/identify');
        }
      }
    });

    return () => clickHandler?.remove();
  }, [state, dispatch, history, color]);

  return (
    <div ref={node} className="bg-white agrc__map">
      {selectorOptions ? <LayerSelector {...selectorOptions}></LayerSelector> : null}
    </div>
  );
}
