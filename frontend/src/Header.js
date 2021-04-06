import React from 'react';
import {Button, Menu, MenuItem} from "@material-ui/core";
import {connect} from "react-redux";

class Header extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            anchorEl: null
        }

        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleClick(event) {
        this.setState({anchorEl: event.currentTarget});
    }

    handleClose() {
        this.setState({anchorEl: null});
    }
    // TODO Implement log out after session management is added
    render() {
      return <header className="page-header">
          <div className="logo logo-ot-appworks"/>
          <div className="header-title">Contract Approval</div>
          <div className="header-menu">
              <Button aria-controls="simple-menu" aria-haspopup="true" onClick={event => this.handleClick(event)}>
                  {this.props.username}
              </Button>
              <Menu
                  anchorEl={this.state.anchorEl}
                  keepMounted
                  open={Boolean(this.state.anchorEl)}
                  onClose={this.handleClose}>
                  <MenuItem onClick={this.handleClose}>Logout</MenuItem>
              </Menu>
          </div>
      </header>
  }
}

const mapStateToProps = state => ({
    username: state.username,
})

export default connect(mapStateToProps)(Header);