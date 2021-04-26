import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import './style/index.scss';
import App from './App';

const initialState = {
  username: '',
  tasks: []
}
function reducer(state = initialState, action) {
  switch (action.type) {
    case "SET_USER_NAME": {
      return Object.assign({}, state, {
        username: action.name
      })
    }
    case "SET_TASKS": {
      return Object.assign({}, state, {
        tasks: action.tasks
      })
    }
    default:
      return state;
  }
}

const store = createStore(reducer);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
