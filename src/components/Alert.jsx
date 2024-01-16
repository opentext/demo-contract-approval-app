import React from 'react';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(
  // eslint-disable-next-line react/jsx-props-no-spreading
  (props, ref) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />,
);

export default Alert;
