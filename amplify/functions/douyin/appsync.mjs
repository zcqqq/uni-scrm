import https from 'https';

export default function appsync(body) {
  const url = 'https://mma7gba3ozbddoagm5o753vwoa.appsync-api.us-east-1.amazonaws.com/graphql';
  const options = {
    method: 'POST', headers: {
      'Content-Type': 'application/json',
      'x-api-key': ''
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, res => {
      let rawData = '';
      res.on('data', chunk => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (err) {
          reject(new Error(err));
        }
      });
    });
    req.on('error', err => {
      reject(new Error(err));
    });
    req.write(JSON.stringify(body));
    console.log('request: ' + JSON.stringify(req));
    req.end();
  });
}