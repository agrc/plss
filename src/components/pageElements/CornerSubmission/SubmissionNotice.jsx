import { useQuery } from '@tanstack/react-query';
import { useFirebaseAuth, useFirebaseFunctions } from '@ugrc/utah-design-system';
import { httpsCallable } from 'firebase/functions';
import { useMemo } from 'react';
import extractTownshipInformation from '../../../../functions/shared/cornerSubmission/blmPointId.js';
import { Button } from '../../formElements/Buttons.jsx';
import Card from '../../formElements/Card.jsx';
import Note from '../../formElements/Note.jsx';

/**
 * @typedef {Object} SubmissionNoticeProps
 * @property {string} pointId
 * @property {string} county
 * @property {function} toggle
 */

/**
 * @type {React.FC<SubmissionNoticeProps>}
 */
export default function SubmissionNotice({ pointId, county, toggle }) {
  const { currentUser } = useFirebaseAuth();

  const townshipInformation = useMemo(() => extractTownshipInformation(pointId), [pointId]);

  const { functions } = useFirebaseFunctions();
  const getProfile = httpsCallable(functions, 'getProfile');

  const { data } = useQuery({
    queryKey: ['profile', currentUser.uid],
    enabled: currentUser !== undefined,
    queryFn: getProfile,
    placeholderData: {
      data: {
        displayName: currentUser?.displayName ?? '',
        email: currentUser?.email ?? '',
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
          This monument record information will be reviewed by the county surveyor under stewardship of this corner to
          satisfy the requirements of state code 17-23-17-7a.
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
