const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
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

  const { username, accountType } = event.body ? JSON.parse(event.body) : event;
  
  if (!username || !accountType) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ message: 'Missing username or accountType' })
    };
  }
  
  let logins = {};
  try {
    const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: LOGINS_KEY }));
    const fileData = await streamToString(getRes.Body);
    logins = JSON.parse(fileData);
  } catch (err) {
    if (err.name !== 'NoSuchKey') {
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ message: 'Error loading logins: ' + err.message })
      };
    }
  }
  
  // Store account type for user
  logins[username] = {
    username,
    accountType,
    lastUpdated: new Date().toISOString()
  };
  
  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: LOGINS_KEY,
      Body: JSON.stringify(logins, null, 2),
      ContentType: 'application/json',
    }));
    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify({ message: 'Account type stored successfully' })
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ message: 'Error saving account type: ' + err.message })
    };
  }
};
