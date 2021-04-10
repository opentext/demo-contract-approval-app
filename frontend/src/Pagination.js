import React from 'react'
import TablePagination from '@material-ui/core/TablePagination';
export default class Pagination extends React.Component {

	onChangePage = (event, page) => {
		this.props.handlePageNumber(page);
	}

	render() {
		return (
			<TablePagination
				rowsPerPageOptions={[10]}
				component="div"
				count={this.props.count}
				rowsPerPage={10}
				page={this.props.pageNumber}
				onChangePage={this.onChangePage}
			/>
		)
	}
}
