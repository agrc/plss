import ky from 'ky';
import { useQuery } from '@tanstack/react-query';
import { resolveProjectData } from '../helpers/index.mjs';

const useProjection = (setLoadingState, context) => {
  const { data, status } = useQuery(
    ['grid', context.grid.northing, context.grid.easting],
    () =>
      ky
        .post('project', {
          body: resolveProjectData({ type: 'grid', state: context.grid }),
          prefixUrl:
            'https://mapserv.utah.gov/arcgis/rest/services/Geometry/GeometryServer',
        })
        .json(),
    {
      enabled: setLoadingState,
    }
  );

  return { data, status };
};

export default useProjection;
