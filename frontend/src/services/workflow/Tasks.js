import axios from 'axios';

export default class Tasks {
  url = "/api/tasks";

  constructor(props) {
    this.props = props;
    axios.defaults.baseURL = '';
  }
  
  async getTasks(offset) {
    return axios({
      method: 'get',
      url: this.url + '?candidateOrAssigned=' + this.props.username + '&includeProcessVariables=true' + (offset ? '&offset='+offset : ''),
    }).catch(error => {
      alert(error.message);
    });
  }

  async claimTask(taskId) {
    return axios({
      method: 'post',
      url: this.url + '/' + taskId,
      data: {
        "action": "claim",
        "assignee": this.props.username
      }
    }).catch(error => {
      alert(error.message);
    });
  }
  
  async completeTask(taskId, approve) {
    return axios({
      method: 'post',
      url: this.url + '/' + taskId,
      data: {
        "action": "complete",
        "outcome": approve ? "accepted" : "rejected",
        "variables": [{
          name: "approvalStatus",
          value: approve ? "accepted" : "rejected"
        }]
      }
    }).catch(error => {
      alert(error.message);
    });
  }

}
