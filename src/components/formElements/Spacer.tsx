type SpacerProps = {
  className?: string;
};

function Spacer({ className = 'my-2' }: SpacerProps) {
  return <div className={className}></div>;
}

export default Spacer;
