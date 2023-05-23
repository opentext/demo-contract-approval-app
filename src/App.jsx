import { useEffect, useState } from 'react';
import { useAuth } from 'oidc-react';
import jwtDecode from 'jwt-decode';
import {
  CircularProgress,
  Tab,
  Tabs,
} from '@material-ui/core';
import './style/App.css';
import Header from './components/Header';
import TabPanel from './components/TabPanel';
import TasksList from './components/TasksList';
import CreatedContractList from './components/CreatedContractList';
import ContractList from './components/ContractList';
import { ApplicationProvider } from './context/ApplicationContext';

function App() {
  const { userData, signOutRedirect } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState([]);

  const handleTabChange = (event, newTabValue) => {
    setTabValue(newTabValue);
  };

  useEffect(() => {
    if (userData) {
      setGroups(
        jwtDecode(userData.id_token)
          .grp
          .map((group) => group.substring(0, group.indexOf('@'))),
      );
      setIsLoading(false);
    }
  }, [userData]);

  if (isLoading) {
    return (
      <div className="loading">
        <CircularProgress color="inherit" />
      </div>
    );
  }

  let tabIndex = 0;
  return (
    <div className="App">
      <Header
        logout={signOutRedirect}
      />
      {
        groups.includes('contract_approval_users')
          ? (
            <div className="page-content">
              <Tabs
                orientation="horizontal"
                value={tabValue}
                onChange={handleTabChange}
              >
                <Tab className="tab-caption" label="Created Contracts" />
                {
                  groups.includes('line_managers')
                  && <Tab className="tab-caption" label="Line Manager Tasks" />
                }
                {
                  groups.includes('risk_managers')
                  && <Tab className="tab-caption" label="Risk Manager Tasks" />
                }
                <Tab className="tab-caption" label="All Contracts" />
              </Tabs>
              <ApplicationProvider>
                <TabPanel value={tabValue} index={tabIndex}>
                  <CreatedContractList />
                </TabPanel>
                {
                  groups.includes('line_managers')
                  && (
                    // eslint-disable-next-line no-plusplus
                    <TabPanel value={tabValue} index={++tabIndex}>
                      <TasksList taskName="Line Manager Approval" />
                    </TabPanel>
                  )
                }
                {
                  groups.includes('risk_managers')
                  && (
                    // eslint-disable-next-line no-plusplus
                    <TabPanel value={tabValue} index={++tabIndex}>
                      <TasksList taskName="Risk Manager Approval" />
                    </TabPanel>
                  )
                }
                <TabPanel value={tabValue} index={tabIndex + 1}>
                  <ContractList />
                </TabPanel>
              </ApplicationProvider>
            </div>
          )
          : (
            <div className="page-content">
              <p>You are not authorized to use this application</p>
              <button type="button" style={{ margin: '0.50rem' }} onClick={signOutRedirect}>
                Logout
              </button>
            </div>
          )
      }
    </div>
  );
}

export default App;
