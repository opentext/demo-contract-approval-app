import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Menu, MenuItem } from '@material-ui/core';

function Header({ authContext, logout }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logUserOut = () => {
    logout(true, authContext.idToken);
    handleClose();
  };

  return (
    <header className="page-header">
      <div className="logo logo-ot-appworks" />
      <div className="header-title">Contract Approval</div>
      <div className="header-menu">
        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
          {authContext.userName}
        </Button>
        <Menu
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          getContentAnchorEl={null}
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={logUserOut}>Logout</MenuItem>
        </Menu>
      </div>
    </header>
  );
}

Header.propTypes = {
  authContext: PropTypes.shape({
    userName: PropTypes.string.isRequired,
    idToken: PropTypes.string.isRequired,
    groups: PropTypes.arrayOf(
      PropTypes.string.isRequired,
    ),
    headers: PropTypes.shape({
      Authorization: PropTypes.string.isRequired,
    }),
  }).isRequired,
  logout: PropTypes.func.isRequired,
};

export default Header;
