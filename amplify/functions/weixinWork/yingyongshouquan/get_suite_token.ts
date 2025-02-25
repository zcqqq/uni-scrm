import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../../../../amplify/data/resource'

export default async function get_suite_token(suite_ticket: String) {
  let axios;
  try {
    axios = require('axios');
  } catch (error) {
    console.error('Failed to load axios:', error);
    throw new Error('Dependencies failed to load');
  }

  let data = JSON.stringify({
    //todo
    "suite_id": "",
    "suite_secret": "",
    "suite_ticket": suite_ticket
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://qyapi.weixin.qq.com/cgi-bin/service/get_suite_token',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    console.log(response);
    return response.data.suite_access_token;
  } catch (error) {
    console.log(error);
    throw error;
  }
}