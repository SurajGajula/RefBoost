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
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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

  const { username, campaignId, referralCode } = event.body ? JSON.parse(event.body) : event;
  
  if (!username || (!campaignId && !referralCode)) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ message: 'Missing username and either campaignId or referralCode' })
    };
  }
  
  let codes = {};
  try {
    const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CODES_KEY }));
    const fileData = await streamToString(getRes.Body);
    codes = JSON.parse(fileData);
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      return { 
        statusCode: 404, 
        headers,
        body: JSON.stringify({ message: 'No codes found' })
      };
    }
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ message: 'Error loading codes: ' + err.message })
    };
  }
  
  // Check if user has codes
  if (!codes[username] || !Array.isArray(codes[username])) {
    return { 
      statusCode: 404, 
      headers,
      body: JSON.stringify({ message: 'No codes found for this user' })
    };
  }
  
  // Find and remove the code by either campaignId or referralCode
  const initialLength = codes[username].length;
  codes[username] = codes[username].filter(code => {
    if (referralCode) {
      return code.code !== referralCode;
    } else if (campaignId) {
      return code.campaignId !== campaignId;
    }
    return true;
  });
  
  // Check if any codes were found and deleted
  if (codes[username].length === initialLength) {
    return { 
      statusCode: 404, 
      headers,
      body: JSON.stringify({ message: 'Code not found or not owned by this user' })
    };
  }
  
  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: CODES_KEY,
      Body: JSON.stringify(codes, null, 2),
      ContentType: 'application/json',
    }));
    
    const deletedCount = initialLength - codes[username].length;
    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify({ 
        message: `Successfully deleted ${deletedCount} referral code(s)`,
        deletedCount 
      })
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ message: 'Error deleting code: ' + err.message })
    };
  }
}; 