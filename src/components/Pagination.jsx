import { PropTypes } from 'prop-types';
import { TablePagination } from '@mui/material';

function Pagination({ pageNumber, count, handlePageNumber }) {
  const onChangePage = (event, newPage) => {
    handlePageNumber(newPage);
  };

  return (
    <TablePagination
      rowsPerPageOptions={[10]}
      component="div"
      count={count}
      rowsPerPage={10}
      page={pageNumber}
      onPageChange={onChangePage}
    />
  );
}

Pagination.propTypes = {
  pageNumber: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  handlePageNumber: PropTypes.func.isRequired,
};

export default Pagination;
