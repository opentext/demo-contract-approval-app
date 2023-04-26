import axios from 'axios';

export default class Tasks {
  url = process.env.REACT_APP_BASE_SERVICE_URL + "/workflow/v1/tasks";

  constructor(props) {
    this.props = props;
  }

  async getTasks(offset) {
    return axios({
      method: 'get',
      url: this.url + '?sort=createTime&order=desc&name=' + encodeURIComponent(this.props.taskname) +'&candidateOrAssigned=' + encodeURIComponent(this.props.authContext.userName) + '&includeProcessVariables=true' + (offset ? '&offset=' + offset : ''),
      headers: this.props.authContext.headers
    }).catch(error => {
      alert(error.response != null && error.response.data != null ? error.response.data : error.message);
    });
  }

  async claimTask(taskId) {
    return axios({
      method: 'post',
      url: this.url + '/' + taskId,
      headers: this.props.authContext.headers,
      data: {
        "action": "claim",
        "assignee": this.props.authContext.userName
      }
    }).catch(error => {
      alert(error.response != null && error.response.data != null ? error.response.data : error.message);
    });
  }

  async completeTask(taskId, approved) {
    return axios({
      method: 'post',
      url: this.url + '/' + taskId,
      headers: this.props.authContext.headers,
      data: {
        "action": "complete",
        "outcome": approved ? "approved" : "rejected",
        "variables": [
          {
              "name": "approver",
              "value": this.props.authContext.userName
          }
      ]
      }
    });
  }
}
