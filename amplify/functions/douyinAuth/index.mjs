import https from 'https';
import querystring from 'querystring';
import appsync from './appsync.mjs';

export const handler = async (event) => {
  const queryStringParameters = event.queryStringParameters;
  // get token
  const url = 'https://open.douyin.com/oauth/access_token/';
  const queryParameters = {
    client_key: '',
    client_secret: '',
    code: queryStringParameters.code,
    grant_type: 'authorization_code'
  };
  const formattedParameters = querystring.stringify(queryParameters);
  const fullUrl = `${url}?${formattedParameters}`;
  const options = {
    method: 'POST'
  };
  console.log('options: ' + JSON.stringify(options));

  const access_tokenResponse = await new Promise((resolve, reject) => {
    const req = https.request(fullUrl, options, res => {
      let rawData = '';
      res.on('data', chunk => { rawData += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(rawData)); } catch (err) { reject(new Error(err)); }
      });
    });
    req.on('error', err => { reject(new Error(err)); });
    req.write(JSON.stringify(''));
    req.end();
    console.log('request: ' + JSON.stringify(req));
  });
  console.log('response: ' + JSON.stringify(access_tokenResponse));

  //update token to channel
  try {
    let channel_id;
    const searchChannelResponse = await appsync({
      query: 'query MyQuery {listChannels(filter: {channel_id: {eq: "' + access_tokenResponse.data.open_id + '"}}) {items {id}}}',
    });
    if (searchChannelResponse.data.listChannels.items.length > 0) {
      channel_id = searchChannelResponse.data.listChannels.items[0].id;
      await appsync({
        query: 'mutation MyMutation {updateChannel(input: {id: "' + channel_id
          + '", douyin_access_token: "' + access_tokenResponse.data.access_token
          + '", douyin_access_expires_in: ' + access_tokenResponse.data.expires_in
          + ', douyin_refresh_expires_in: ' + access_tokenResponse.data.refresh_expires_in
          + ', douyin_refresh_token: "' + access_tokenResponse.data.refresh_token
          + '", douyin_scope: "' + access_tokenResponse.data.scope
          + '"}){id}}',
      });
    }
  } catch (error) { return { statusCode: 400, body: error.message, }; }
}