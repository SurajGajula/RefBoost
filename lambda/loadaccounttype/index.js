const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Readable } = require('stream');

const s3 = new S3Client({ region: 'us-west-2' });
const BUCKET = 'refboost';
const LOGINS_KEY = 'logins.json';

async function streamToString(stream) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({})
    };
  }

  const { username } = event.body ? JSON.parse(event.body) : event;
  
  if (!username) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ message: 'Missing username' })
    };
  }
  
  let logins = {};
  try {
    const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: LOGINS_KEY }));
    const fileData = await streamToString(getRes.Body);
    logins = JSON.parse(fileData);
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      return { 
        statusCode: 404, 
        headers,
        body: JSON.stringify({ message: 'No account type found' })
      };
    }
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ message: 'Error loading logins: ' + err.message })
    };
  }
  
  const userLogin = logins[username];
  if (!userLogin) {
    return { 
      statusCode: 404, 
      headers,
      body: JSON.stringify({ message: 'No account type found for user' })
    };
  }
  
  return { 
    statusCode: 200, 
    headers,
    body: JSON.stringify({
      username: userLogin.username,
      accountType: userLogin.accountType,
      lastUpdated: userLogin.lastUpdated
    })
  };
};
