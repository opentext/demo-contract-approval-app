import React from 'react';
import axios from "axios";
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import {
  Backdrop,
  CircularProgress,
  Tab,
  Tabs
} from "@material-ui/core";

import './style/App.scss';
import Header from './Header.js';
import LoginDialog from './LoginDialog.js';
import TasksList from './TasksList.js';
import CreatedContractList from './CreatedContractList';
import ContractList from './ContractList';

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

class App extends React.Component {
  constructor(props) {
    super(props);
    axios.defaults.withCredentials = true;
    this.state = {
      value: 0,
      isLoaded: false
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = (event, newValue) => {
    this.setState({ value: newValue });
  }

  async componentDidMount() {
    // Check whether there is an existing session in the backend
    await axios.get('/session')
      .then(res => {
        if (res.data.email) {
          console.log('There is a session - No login needed');
          this.props.dispatch({ type: "SET_USER_NAME", name: res.data.email });
        } else {
          console.log('No session - Displaying login dialog');
        }
      })
      .catch((err) => console.log(err))
      .finally(() => this.setState({ isLoaded: true }));
  }

  render() {
    const isLoggedIn = Boolean(this.props.username);
    // Display a backdrop and spinning circle while the view initialises
    if (!this.state.isLoaded) {
      return (
        <Backdrop open={true}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )
    }
    return (
      <div className="App">
        <Header />
        <div className="page-content">
          <Tabs orientation="horizontal"
            value={this.state.value}
            onChange={this.handleChange}>
            <Tab className="tab-caption" label="Created Contracts" />
            <Tab className="tab-caption" label="Manager Tasks" />
            <Tab className="tab-caption" label="All Contracts" />
          </Tabs>
          <TabPanel value={this.state.value} index={0}>
            <CreatedContractList />
          </TabPanel>
          <TabPanel value={this.state.value} index={1}>
            <TasksList />
          </TabPanel>
          <TabPanel value={this.state.value} index={2}>
            <ContractList />
          </TabPanel>
        </div>
        <LoginDialog open={!isLoggedIn} />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  username: state.username
})

export default connect(mapStateToProps)(App);
