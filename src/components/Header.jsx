import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { Button, Menu, MenuItem } from '@mui/material';

function Header() {
  const { signoutRedirect, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logUserOut = () => {
    signoutRedirect();
    handleClose();
  };

  return (
    <header className="page-header">
      <div className="logo logo-ot" />
      <div className="header-title">Contract Approval</div>
      <div className="header-menu">
        <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
          {user.profile.preferred_username}
        </Button>
        <Menu
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default Header;
