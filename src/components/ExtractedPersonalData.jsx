import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

function ExtractedPersonalData({ open, selectedContract, onClose }) {
  const formatExtractedTerms = (arr) => {
    if (arr) {
      return arr.map((str, index) => (str.startsWith('**')
        // eslint-disable-next-line react/no-array-index-key
        ? <p style={{ lineHeight: '1em' }} key={index}><b>{str.substring(2)}</b></p>
        // eslint-disable-next-line react/no-array-index-key
        : <p style={{ lineHeight: '1em' }} key={index}>{`- ${str}`}</p>
      ));
    }
    return '';
  };

  const closeDialog = () => onClose();

  return (
    <Dialog open={open} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Extracted Terms</DialogTitle>
      <DialogContent>
        <div>{formatExtractedTerms(selectedContract.properties.extracted_terms)}</div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => closeDialog()} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ExtractedPersonalData.propTypes = {
  open: PropTypes.bool.isRequired,
  selectedContract: PropTypes.shape({
    properties: PropTypes.shape({
      extracted_terms: PropTypes.arrayOf(
        PropTypes.string.isRequired,
      ),
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ExtractedPersonalData;
