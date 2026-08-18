import { useQuery } from '@tanstack/react-query';
import extractTownshipInformation from '@ugrc/plss-shared/corner-submission/blm-point-id';
import type { Profile } from '@ugrc/plss-shared/corner-submission/schema';
import { useFirebaseAuth } from '@ugrc/utah-design-system/contexts/FirebaseAuthProvider';
import { useFirebaseFunctions } from '@ugrc/utah-design-system/contexts/FirebaseFunctionsProvider';
import { httpsCallable } from 'firebase/functions';
import { useMemo } from 'react';
import { Button } from '../../formElements/Buttons.js';
import Card from '../../formElements/Card.js';
import Note from '../../formElements/Note.js';

type SubmissionNoticeProps = {
  pointId: string;
  county?: string;
  toggle: () => void;
};

export default function SubmissionNotice({ pointId, county, toggle }: SubmissionNoticeProps) {
  const { currentUser } = useFirebaseAuth();

  const townshipInformation = useMemo(() => extractTownshipInformation(pointId), [pointId]);

  const { functions } = useFirebaseFunctions();
  const getProfile = httpsCallable<undefined, Partial<Profile>>(functions, 'getProfile');
  const fallbackProfile: Partial<Profile> = {
    displayName: currentUser?.displayName ?? '',
    email: currentUser?.email ?? '',
    license: '',
  };

  const { data } = useQuery({
    queryKey: ['profile', currentUser?.uid],
    enabled: Boolean(currentUser),
    queryFn: () => getProfile(),
    placeholderData: {
      data: fallbackProfile,
    },
    staleTime: Infinity,
  });
  const profile = data?.data ?? fallbackProfile;

  const location = {
    county: county ?? 'Unknown',
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
          <span>{profile.displayName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Surveyor License</span>
          <span>{profile.license}</span>
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
