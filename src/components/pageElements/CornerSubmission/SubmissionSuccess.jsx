import PropTypes from 'prop-types';
import { Button } from '../../formElements/Buttons.jsx';
import usePageView from '../../hooks/usePageView.jsx';

export default function SubmissionSuccess({ dispatch }) {
  usePageView('screen-submission-success');

  return (
    <main className="mt-3 inline-grid gap-4">
      <div>
        <h2 className="text-2xl font-semibold">Submission success</h2>
        <p className="ml-3 text-sm leading-none">What happens next?</p>
      </div>
      <p className="ml-3">
        The PLSS team at UGRC has been notified of your submission. They will review the submission and approve the
        sheet if there are no errors.
      </p>
      <p className="ml-3">
        Next, UGRC will share the approved sheet with the representative from the county the monument is located in. The
        county representative will then review the submission and approve the sheet if there are no errors. They are
        provided 10 days to comment and after that time period they implicitly approve the sheet.
      </p>
      <p className="ml-3">
        Once the sheet is approved, the monument record sheet pdf will be accessible through this PLSS website. UGRC
        will then use the submitted coordinates to improve the PLSS point dataset and fabric.
      </p>
      <h2 className="text-2xl font-semibold">Tracking progress</h2>
      <p className="ml-3">
        You can track the progress of this submission and all of your prior submissions by clicking on the{' '}
        <Button onClick={() => dispatch({ type: 'menu/toggle', payload: 'content' })} style="link">
          My Content
        </Button>{' '}
        menu link.
      </p>
    </main>
  );
}
SubmissionSuccess.propTypes = {
  dispatch: PropTypes.func,
};
