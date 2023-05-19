import axios from 'axios';

class Tasks {
  constructor(authContext, taskName) {
    this.url = `${process.env.REACT_APP_BASE_SERVICE_URL}/workflow/v1/tasks`;
    this.authContext = authContext;
    this.taskName = taskName;
  }

  async getTasks(offset) {
    return axios({
      method: 'get',
      url: `${this.url}?sort=createTime&order=desc&name=${encodeURIComponent(this.taskName)}&candidateOrAssigned=${encodeURIComponent(this.authContext.userName)}&includeProcessVariables=true${(offset ? `&offset=${offset}` : '')}`,
      headers: this.authContext.headers,
    }).catch((error) => {
      // eslint-disable-next-line no-alert
      alert(
        error.response != null && error.response.data != null ? error.response.data : error.message,
      );
    });
  }

  async claimTask(taskId) {
    return axios({
      method: 'post',
      url: `${this.url}/${taskId}`,
      headers: this.authContext.headers,
      data: {
        action: 'claim',
        assignee: this.authContext.userName,
      },
    }).catch((error) => {
      // eslint-disable-next-line no-alert
      alert(
        error.response != null && error.response.data != null ? error.response.data : error.message,
      );
    });
  }

  async completeTask(taskId, approved) {
    return axios({
      method: 'post',
      url: `${this.url}/${taskId}`,
      headers: this.authContext.headers,
      data: {
        action: 'complete',
        outcome: approved ? 'approved' : 'rejected',
        variables: [
          {
            name: 'approver',
            value: this.authContext.userName,
          },
        ],
      },
    });
  }
}

export default Tasks;
