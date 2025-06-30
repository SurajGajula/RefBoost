const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Readable } = require('stream');

// Configure your region and credentials as needed
const s3 = new S3Client({ region: 'us-west-2' }); // Update region if needed
const BUCKET = 'refboost'; // Set your bucket name
const CAMPAIGNS_KEY = 'campaigns.json';

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

  const { username, campaignId } = event.body ? JSON.parse(event.body) : event;
  
  if (!username || !campaignId) {
    return { 
      statusCode: 400, 
      headers,
      body: JSON.stringify({ message: 'Missing username or campaignId' })
    };
  }
  
  let campaigns = {};
  try {
    const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CAMPAIGNS_KEY }));
    const fileData = await streamToString(getRes.Body);
    campaigns = JSON.parse(fileData);
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      return { 
        statusCode: 404, 
        headers,
        body: JSON.stringify({ message: 'No campaigns found' })
      };
    }
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ message: 'Error loading campaigns: ' + err.message })
    };
  }
  
  // Check if user has campaigns
  if (!campaigns[username] || !Array.isArray(campaigns[username])) {
    return { 
      statusCode: 404, 
      headers,
      body: JSON.stringify({ message: 'No campaigns found for this user' })
    };
  }
  
  // Find and remove the campaign
  const initialLength = campaigns[username].length;
  campaigns[username] = campaigns[username].filter(campaign => campaign.id !== campaignId);
  
  // Check if campaign was found and deleted
  if (campaigns[username].length === initialLength) {
    return { 
      statusCode: 404, 
      headers,
      body: JSON.stringify({ message: 'Campaign not found or not owned by this user' })
    };
  }
  
  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: CAMPAIGNS_KEY,
      Body: JSON.stringify(campaigns, null, 2),
      ContentType: 'application/json',
    }));
    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify({ message: 'Campaign deleted successfully' })
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ message: 'Error deleting campaign: ' + err.message })
    };
  }
}; 