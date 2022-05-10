import React, { useState } from 'react';
import {
  AuthProvider,
  AuthService,
  useAuth,
} from 'react-oauth2-pkce';
import {
  Tab,
  Tabs
} from "@material-ui/core";

import './style/App.scss';
import Header from './Header';
import TabPanel from './TabPanel';
import TasksList from './TasksList';
import CreatedContractList from './CreatedContractList';
import ContractList from './ContractList';
import { ApplicationProvider } from './context/ApplicationContext';

const authService = new AuthService({
  clientId: process.env.REACT_APP_CLIENT_ID,
  authorizeEndpoint: process.env.REACT_APP_BASE_URL + '/tenants/' + process.env.REACT_APP_TENANT_ID + '/oauth2/auth',
  tokenEndpoint: process.env.REACT_APP_BASE_URL + '/tenants/' + process.env.REACT_APP_TENANT_ID + '/oauth2/token',
  logoutEndpoint: process.env.REACT_APP_BASE_URL + '/tenants/' + process.env.REACT_APP_TENANT_ID + '/oauth2/logout',
  redirectUri: process.env.REACT_APP_REDIRECT_URI,
  scopes: ['openid'],
});

function App() {
  const [value, setValue] = useState(0);

  const { authService } = useAuth();

  const login = async () => authService.authorize();
  const logout = async (shouldEndSession) => authService.logout(shouldEndSession);

  if (authService.isPending()) {
    return (
      <div className="page-content">
        <p>Loading...</p>
        <button style={{ margin: "0.50rem" }} onClick={() => { logout(true); login(); }}>Reset</button>
      </div>
    );
  }

  if (!authService.isAuthenticated()) {
    login();
    return (
      <div className="page-content">
        <p>Logging in ...</p>
      </div>
    );
  }

  const authContext = {
    userName: authService.getUser().name,
    idToken: authService.getAuthTokens().id_token,
    headers: {
      Authorization: `Bearer ${authService.getAuthTokens().access_token}`
    }
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  // This custom logout is required, as the standard PKCE React library (react-oauth2-pkce) doesn't support the id_token_hint mechanism (which is what the OpenText Developer Cloud uses).
  // A request with the owners of the react-oauth2-pkce library has been logged to add the id_token_hint support. Feel free to inquire on the matter yourself.
  const logoutWithIdTokenHint = (shouldEndSession, idToken) => {
    logout(shouldEndSession);
    window.location.replace(process.env.REACT_APP_BASE_URL + '/tenants/' + process.env.REACT_APP_TENANT_ID + '/oauth2/logout?id_token_hint=' + encodeURIComponent(idToken) + '&post_logout_redirect_uri=' + encodeURIComponent(process.env.REACT_APP_REDIRECT_URI));
  }

  return (
    <div className="App">
      <Header
        authContext={authContext}
        logout={logoutWithIdTokenHint}
      />
      <div className="page-content">
        <Tabs orientation="horizontal"
          value={value}
          onChange={handleChange}>
          <Tab className="tab-caption" label="Created Contracts" />
          <Tab className="tab-caption" label="Line Manager Tasks" />
          <Tab className="tab-caption" label="Risk Manager Tasks" />
          <Tab className="tab-caption" label="All Contracts" />
        </Tabs>
        <ApplicationProvider>
          <TabPanel value={value} index={0}>
            <CreatedContractList authContext={authContext} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <TasksList authContext={authContext} taskname="Line Manager Approval" />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <TasksList authContext={authContext} taskname="Risk Manager Approval" />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <ContractList authContext={authContext} />
          </TabPanel>
        </ApplicationProvider>
      </div>
    </div>
  );
}

function WrappedSecuredApp() {
  return (
    <AuthProvider authService={authService} >
      <App />
    </AuthProvider>
  );
}

export default WrappedSecuredApp;
