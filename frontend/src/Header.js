import React from 'react';
import { connect } from "react-redux";
import axios from "axios";
import { Button, Menu, MenuItem } from "@material-ui/core";

class Header extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            anchorEl: null
        }

        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.logUserOut = this.logUserOut.bind(this);
    }

    handleClick(event) {
        this.setState({ anchorEl: event.currentTarget });
    }

    handleClose() {
        this.setState({ anchorEl: null });
    }

    logUserOut() {
        console.log('Logging out');
        axios.post('/logout')
            .then(() => {
                console.log('User logged out');
                this.props.dispatch({ type: "SET_USER_NAME", name: null });
            })
            .catch(err => console.log(err));
        this.handleClose();
    }

    render() {
        return <header className="page-header">
            <div className="logo logo-ot-appworks" />
            <div className="header-title">Contract Approval</div>
            <div className="header-menu">
                <Button aria-controls="simple-menu" aria-haspopup="true" onClick={event => this.handleClick(event)}>
                    {this.props.username}
                </Button>
                <Menu
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    getContentAnchorEl={null}
                    anchorEl={this.state.anchorEl}
                    keepMounted
                    open={Boolean(this.state.anchorEl)}
                    onClose={this.handleClose}>
                    <MenuItem onClick={this.logUserOut}>Logout</MenuItem>
                </Menu>
            </div>
        </header>
    }
}

const mapStateToProps = state => ({
    username: state.username,
})

export default connect(mapStateToProps)(Header);
