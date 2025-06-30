const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Readable } = require('stream');

const s3 = new S3Client({ region: 'us-west-2' });
const BUCKET = 'refboost';
const USERS_KEY = 'users.json';

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

  const { username, password } = event.body ? JSON.parse(event.body) : event;
  
  if (!username || !password) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ message: 'Missing username or password' })
    };
  }
  
  let users = {};
  try {
    const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: USERS_KEY }));
    const fileData = await streamToString(getRes.Body);
    users = JSON.parse(fileData);
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      return { 
        statusCode: 401, 
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ message: 'Error loading users: ' + err.message })
    };
  }
  
  const user = users[username];
  if (!user || user.password !== password) {
    return { 
      statusCode: 401, 
      headers,
      body: JSON.stringify({ message: 'Invalid credentials' })
    };
  }
  
  // Do not return password in response
  const { password: _, ...userData } = user;
  return { 
    statusCode: 200, 
    headers,
    body: JSON.stringify(userData)
  };
}; 