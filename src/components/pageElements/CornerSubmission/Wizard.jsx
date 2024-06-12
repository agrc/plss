import { Button } from '../../formElements/Buttons.jsx';
import PropTypes from 'prop-types';

export default function Wizard({ back = false, next = false, finish, clear, status }) {
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
            middle: back && (next || finish),
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
        <Button
          buttonGroup={{ right: true }}
          type="submit"
          state={status}
          onClick={finish}
        >
          {getButtonText(status)}
        </Button>
      )}
    </div>
  );
}

Wizard.propTypes = {
  back: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  next: PropTypes.bool,
  finish: PropTypes.func,
  clear: PropTypes.func,
  status: PropTypes.string,
};

const getButtonText = (status) => {
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
