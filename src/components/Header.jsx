import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from 'oidc-react';

import { Button, Menu, MenuItem } from '@material-ui/core';

function Header({ logout }) {
  const { userData } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logUserOut = () => {
    logout();
    handleClose();
  };

  return (
    <header className="page-header">
      <div className="logo logo-ot-appworks" />
      <div className="header-title">Contract Approval</div>
      <div className="header-menu">
        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
          {userData.profile.preferred_username}
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
  logout: PropTypes.func.isRequired,
};

export default Header;
