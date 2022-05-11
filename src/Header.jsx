import React, { useState } from 'react';
import { Button, Menu, MenuItem } from "@material-ui/core";

function Header(props) {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    const logUserOut = () => {
        props.logout(true, props.authContext.idToken);
        handleClose();
    }

    return (
        <header className="page-header">
            <div className="logo logo-ot-appworks" />
            <div className="header-title">Contract Approval</div>
            <div className="header-menu">
                <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                    {props.authContext.userName}
                </Button>
                <Menu
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    getContentAnchorEl={null}
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}>
                    <MenuItem onClick={logUserOut}>Logout</MenuItem>
                </Menu>
            </div>
        </header>
    );
}

export default Header;
