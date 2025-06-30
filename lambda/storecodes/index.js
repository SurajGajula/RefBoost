const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Readable } = require('stream');

// Configure your region and credentials as needed
const s3 = new S3Client({ region: 'us-west-2' }); // Update region if needed
const BUCKET = 'refboost'; // Set your bucket name
const CODES_KEY = 'codes.json';

// Helper to stream S3 object to string
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

  const { username, code } = event.body ? JSON.parse(event.body) : event;
  
  if (!username || !code) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ message: 'Missing username or code' })
    };
  }
  
  let codes = {};
  try {
    const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CODES_KEY }));
    const fileData = await streamToString(getRes.Body);
    codes = JSON.parse(fileData);
  } catch (err) {
    if (err.name !== 'NoSuchKey') {
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ message: 'Error loading codes: ' + err.message })
      };
    }
  }
  
  if (!codes[username]) codes[username] = [];
  codes[username].push(code);
  
  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: CODES_KEY,
      Body: JSON.stringify(codes, null, 2),
      ContentType: 'application/json',
    }));
    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify({ message: 'Code saved successfully' })
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ message: 'Error saving code: ' + err.message })
    };
  }
}; 