import Card from '../../formElements/Card.jsx';
import Note from '../../formElements/Note.jsx';
import { Button } from '../../formElements/Buttons.jsx';
import extractTownshipInformation from './blmPointId.mjs';
import { httpsCallable } from 'firebase/functions';
import { useUser, useFunctions } from 'reactfire';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function SubmissionNotice({ pointId, county, toggle }) {
  const { data: user } = useUser();

  const townshipInformation = useMemo(
    () => extractTownshipInformation(pointId),
    [pointId],
  );

  const functions = useFunctions();
  const getProfile = httpsCallable(functions, 'getProfile');

  const { data } = useQuery({
    queryKey: ['profile', user.uid],
    enabled: user?.uid?.length > 0,
    queryFn: getProfile,
    placeholderData: {
      data: {
        displayName: user?.displayName ?? '',
        email: user?.email ?? '',
        license: '',
      },
    },
    staleTime: Infinity,
  });

  const location = {
    county: county,
    meridian: townshipInformation.meridian.abbr,
    township: townshipInformation.township,
    range: townshipInformation.range,
  };

  return (
    <div className="mb-4 inline-grid">
      <Card>
        <Note>
          This monument record information will be reviewed by the county
          surveyor under stewardship of this corner to satisfy the requirements
          of state code 17-23-17-7a.
        </Note>
        <div className="flex justify-between">
          <span className="font-semibold">Submitted By</span>
          <span>{data.data.displayName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Surveyor License</span>
          <span>{data.data.license}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">BLM Point #</span>
          <span>{pointId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">County</span>
          <span>{location.county}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Township</span>
          <span>
            {location.meridian}T{location.township}R{location.range}
          </span>
        </div>
        <div className="mt-2 flex justify-center">
          <Button style="alternate" onClick={toggle}>
            close
          </Button>
        </div>
      </Card>
    </div>
  );
}
SubmissionNotice.propTypes = {
  pointId: PropTypes.string.isRequired,
  county: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired,
};
