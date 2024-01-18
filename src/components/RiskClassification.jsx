import { useState } from 'react';
import { PropTypes } from 'prop-types';
import { IconButton } from '@mui/material';
import { Info } from '@mui/icons-material';

import ExtractedPersonalData from './ExtractedPersonalData';

const riskClassifications = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'VERY HIGH'];

function RiskClassification({ row }) {
  const [openExtractedPersonalData, setOpenExtratedPersonalData] = useState(false);

  const showExtractedPersonalData = () => {
    setOpenExtratedPersonalData(true);
  };

  const handleCloseExtractedPersonalData = () => {
    setOpenExtratedPersonalData(false);
  };

  return (
    <div>
      {riskClassifications[row.properties.risk_classification - 1]}
      <IconButton size="small" variant="outlined" color="primary" title="Show extracted personal data" onClick={() => showExtractedPersonalData(row)}>
        <Info />
      </IconButton>
      <ExtractedPersonalData
        open={openExtractedPersonalData}
        selectedContract={row}
        onClose={handleCloseExtractedPersonalData}
      />
    </div>
  );
}

RiskClassification.propTypes = {
  row: PropTypes.shape({
    properties: PropTypes.shape({
      risk_classification: PropTypes.number.isRequired,
    }),
  }).isRequired,
};

export default RiskClassification;
