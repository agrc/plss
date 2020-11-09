import React, { useEffect, useState, useRef } from 'react';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import LOD from '@arcgis/core/layers/support/LOD';
import TileInfo from '@arcgis/core/layers/support/TileInfo';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import WebTileLayer from '@arcgis/core/layers/WebTileLayer';
import LayerSelector from '@agrc/layer-selector';

const urls = {
  landownership: 'https://gis.trustlands.utah.gov/server/' +
    '/rest/services/Ownership/UT_SITLA_Ownership_LandOwnership_WM/FeatureServer/0'
};

export default function PlssMap() {
  const node = useRef(null);
  const [selectorOptions, setSelectorOptions] = useState();

  useEffect(() => {
    if (!node.current) {
      return;
    }

    const esriMap = new EsriMap({
      basemap: {}
    });
    const mapView = new MapView({
      container: node.current,
      map: esriMap,
      padding: {
        left: 60
      },
      extent: {
        xmax: -11762120.612131765,
        xmin: -13074391.513731329,
        ymax: 5225035.106177688,
        ymin: 4373832.359194187,
        spatialReference: 3857
      },
      ui: {
        components: ['zoom']
      }
    });

    setSelectorOptions({
      view: mapView,
      quadWord: process.env.REACT_APP_DISCOVER,
      baseLayers: ['Hybrid', 'Lite', 'Terrain', 'Topo', 'Color IR'],
      overlays: ['Address Points', {
        Factory: FeatureLayer,
        url: urls.landownership,
        id: 'Land Ownership',
        opacity: 0.3
      }],
      modules: { LOD, TileInfo, Basemap, WebTileLayer, FeatureLayer },
      position: 'top-right'
    });
  }, []);

  return (
    <div ref={node} className="w-screen h-screen bg-white">
      { selectorOptions ? <LayerSelector {...selectorOptions}></LayerSelector> : null}
    </div>
  );
}
