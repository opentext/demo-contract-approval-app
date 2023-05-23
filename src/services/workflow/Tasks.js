import axios from 'axios';

class Tasks {
  constructor(userData, taskName) {
    this.url = `${process.env.REACT_APP_BASE_SERVICE_URL}/workflow/v1/tasks`;
    this.userData = userData;
    this.taskName = taskName;
  }

  async getTasks(offset) {
    return axios({
      method: 'get',
      url: `${this.url}?sort=createTime&order=desc&name=${encodeURIComponent(this.taskName)}&candidateOrAssigned=${encodeURIComponent(this.userData.profile.preferred_username)}&includeProcessVariables=true${(offset ? `&offset=${offset}` : '')}`,
      headers: {
        Authorization: `Bearer ${this.userData.access_token}`,
      },
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
      headers: {
        Authorization: `Bearer ${this.userData.access_token}`,
      },
      data: {
        action: 'claim',
        assignee: this.userData.profile.preferred_username,
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
      headers: {
        Authorization: `Bearer ${this.userData.access_token}`,
      },
      data: {
        action: 'complete',
        outcome: approved ? 'approved' : 'rejected',
        variables: [
          {
            name: 'approver',
            value: this.userData.profile.preferred_username,
          },
        ],
      },
    });
  }
}

export default Tasks;
