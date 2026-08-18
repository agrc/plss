import { Button } from '../../formElements/Buttons.js';

type SubmissionStatus = 'pending' | 'success' | 'error';

type WizardProps = {
  back?: (() => void) | false;
  next?: boolean;
  finish?: () => void;
  clear?: () => void;
  status?: SubmissionStatus;
};

export default function Wizard({ back = false, next = false, finish, clear, status }: WizardProps) {
  return (
    <div className="flex justify-center">
      {back && (
        <Button style="secondary" buttonGroup={{ left: true }} onClick={back}>
          Back
        </Button>
      )}
      {clear && (
        <Button
          style="alternate"
          buttonGroup={{
            middle: Boolean(back && (next || finish)),
            left: !back,
          }}
          onClick={clear}
        >
          Clear
        </Button>
      )}
      {next && (
        <Button buttonGroup={{ right: true }} type="submit">
          Next
        </Button>
      )}
      {finish && (
        <Button buttonGroup={{ right: true }} type="submit" state={status} onClick={finish}>
          {getButtonText(status)}
        </Button>
      )}
    </div>
  );
}

const getButtonText = (status?: SubmissionStatus): string => {
  switch (status) {
    case 'pending':
      return 'Submitting...';
    case 'success':
      return 'Submitted!';
    case 'error':
      return 'Error';
    default:
      return 'Submit';
  }
};
