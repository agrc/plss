import Point from '@arcgis/core/geometry/Point';
import { Transition } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { useOpenClosed } from '@ugrc/utilities/hooks';
import ky from 'ky';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Button } from '../../formElements/Buttons.jsx';
import { Input } from '../../formElements/Inputs.jsx';
import usePageView from '../../hooks/usePageView.jsx';
import TieSheetList from '../TieSheetList.jsx';
const client = ky.create({
  prefixUrl: 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/PLSS_Monuments/FeatureServer/0',
});

export default function MonumentRecord({ dispatch }) {
  const [pointId, setPointId] = useState('');
  const [isOpen, { open, close }] = useOpenClosed(false);
  const { analytics, logEvent } = usePageView('screen-monument-record-finder');

  const { data } = useQuery({
    queryKey: [pointId, 'location', analytics],
    queryFn: async () => {
      logEvent(analytics, 'monument-record', { pointId });

      const response = await client
        .get('query', {
          searchParams: {
            where: `point_id='${pointId}'`,
            f: 'json',
          },
        })
        .json();

      if (!response || response.error) {
        logEvent(analytics, 'monument-record-error', { response });

        throw new Error('Error fetching location');
      }

      const count = response?.features?.length ?? 0;

      if (count === 0 || count > 1) {
        logEvent(analytics, 'monument-record-error', { response });

        throw new Error('An incorrect response count was received.', count);
      }

      return new Point({
        type: 'point',
        x: response.features[0].geometry.x,
        y: response.features[0].geometry.y,
        spatialReference: 3857,
      });
    },
    enabled: pointId.length > 5 && isOpen === true,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data) {
      dispatch({
        type: 'map/center-and-zoom',
        payload: data,
        meta: {
          scale: 4500,
        },
      });
    }
  }, [data, dispatch]);

  return (
    <section className="mx-auto grid max-w-prose gap-2">
      <div className="flex-1">
        <Input
          label="BLM Point Id"
          placeholder="UT260010S0130W0_600100"
          value={pointId}
          onChange={(e) => {
            close();
            setPointId(e.target.value);
          }}
        />
      </div>
      <Transition
        as="div"
        appear
        show={isOpen}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <TieSheetList blmPointId={pointId} />
      </Transition>
      <div className="mt-4 flex justify-center">
        <Button onClick={open}>Find</Button>
      </div>
    </section>
  );
}
MonumentRecord.displayName = 'MonumentRecord';
MonumentRecord.propTypes = {
  dispatch: PropTypes.func,
};
