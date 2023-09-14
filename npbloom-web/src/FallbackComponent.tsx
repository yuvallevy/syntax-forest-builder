import { FallbackProps } from 'react-error-boundary';
import { Code, Modal } from '@mantine/core';

const FallbackComponent: React.FC<FallbackProps> = ({ error }) =>
  <Modal opened centered title="Oops" closeOnClickOutside={false} size="lg" onClose={() => window.location.reload()}>
    <p>NPBloom just crashed &ndash; sorry! There might be more details below.</p>
    <Code block>{JSON.stringify({ name: error.name, message: error.message }, null, 2)}</Code>
  </Modal>;

export default FallbackComponent;
