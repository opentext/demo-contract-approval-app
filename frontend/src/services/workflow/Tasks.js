import axios from 'axios';

export default class Tasks {
  url = "/api/tasks";

  constructor(props) {
    this.props = props;
  }

  async getTasks(offset) {
    return axios({
      method: 'get',
      url: this.url + '?sort=createTime&order=desc&candidateOrAssigned=' + encodeURIComponent(this.props.username) + '&includeProcessVariables=true' + (offset ? '&offset=' + offset : ''),
    }).catch(error => {
      alert(error.response != null && error.response.data != null ? error.response.data : error.message);
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
      alert(error.response != null && error.response.data != null ? error.response.data : error.message);
    });
  }

  async completeTask(taskId, approved) {
    return axios({
      method: 'post',
      url: this.url + '/' + taskId,
      data: {
        "action": "complete",
        "outcome": approved ? "approved" : "rejected"
      }
    });
  }
}
