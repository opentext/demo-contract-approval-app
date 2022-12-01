import React, { useState } from 'react';
import {
  Tab,
  Tabs
} from "@material-ui/core";

import './style/App.css';
import { AuthProvider, authService, login, logout, logoutWithIdTokenHint, useAuth } from './authorization/ocpRestClient';
import Header from './Header';
import TabPanel from './TabPanel';
import TasksList from './TasksList';
import CreatedContractList from './CreatedContractList';
import ContractList from './ContractList';
import { ApplicationProvider } from './context/ApplicationContext';
import jwtDecode from 'jwt-decode';

function App() {
  const [value, setValue] = useState(0);

  const { authService } = useAuth();

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

  const groups = jwtDecode(authService.getAuthTokens().id_token).grp.map(function (group) {
    const fullGroupName = JSON.stringify(group);
    return (fullGroupName.substring(1, fullGroupName.indexOf('@')));
  });

  const authContext = {
    userName: authService.getUser().preferred_username,
    idToken: authService.getAuthTokens().id_token,
    groups: groups,
    headers: {
      Authorization: `Bearer ${authService.getAuthTokens().access_token}`
    }
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  let tabIndex = 0;

  return (
    <div className="App">
      <Header
        authContext={authContext}
        logout={logoutWithIdTokenHint}
      />
      {
        authContext.groups.includes("contract_approval_users")
        ?
        <div className="page-content">
          <Tabs orientation="horizontal"
            value={value}
            onChange={handleChange}>
            <Tab className="tab-caption" label="Created Contracts" />
            {
              authContext.groups.includes("line_managers") &&
              <Tab className="tab-caption" label="Line Manager Tasks" />
            }
            {
              authContext.groups.includes("risk_managers") &&
              <Tab className="tab-caption" label="Risk Manager Tasks" />
            }
            <Tab className="tab-caption" label="All Contracts" />
          </Tabs>
          <ApplicationProvider>
            <TabPanel value={value} index={tabIndex ++}>
              <CreatedContractList authContext={authContext} />
            </TabPanel>
            {
              authContext.groups.includes("line_managers") &&
              <TabPanel value={value} index={tabIndex ++}>
                <TasksList authContext={authContext} taskname="Line Manager Approval" />
              </TabPanel>
            }
            {
              authContext.groups.includes("risk_managers") &&
              <TabPanel value={value} index={tabIndex ++}>
                <TasksList authContext={authContext} taskname="Risk Manager Approval" />
              </TabPanel>
            }
            <TabPanel value={value} index={tabIndex ++}>
              <ContractList authContext={authContext} />
            </TabPanel>
          </ApplicationProvider>
        </div>
        :
        <div className="page-content">
          <p>You are not authorized to use this application</p>
          <button style={{ margin: "0.50rem" }} onClick={() => { logoutWithIdTokenHint(true, authContext.idToken); }}>Logout</button>
        </div>
      }
    </div>
  );
}

const WrappedSecuredApp = () => {
  return (
    <AuthProvider authService={authService} >
      <App />
    </AuthProvider>
  );
}

export default WrappedSecuredApp;
