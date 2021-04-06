import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header.js';
import LoginDialog from './LoginDialog.js';
import TasksList from './TasksList.js';
import CreatedContractList from './CreatedContractList';
import ContractList from './ContractList';
import './style/App.scss';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
          <div>{children}</div>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: '',
      value: 0
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = (event, newValue) => {
    this.setState({value: newValue});
  }

  render() {
    return (
      <div className="App">
        <Header />
        <div className="page-content">
          <Tabs orientation="horizontal"
              value={this.state.value}
              onChange={this.handleChange}>
            <Tab className="tab-caption" label="Created Contracts"></Tab>
            <Tab className="tab-caption" label="Manager Tasks"></Tab>
            <Tab className="tab-caption" label="All Contracts"></Tab>
          </Tabs>
          <TabPanel value={this.state.value} index={0}>
            <CreatedContractList/>
          </TabPanel>
          <TabPanel value={this.state.value} index={1}>
            <TasksList/>
          </TabPanel>
          <TabPanel value={this.state.value} index={2}>
            <ContractList/>
          </TabPanel>
        </div>
        <LoginDialog/>
      </div>
    )
  }
}
