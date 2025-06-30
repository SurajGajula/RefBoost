const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
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
  
  try {
    const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CAMPAIGNS_KEY }));
    const fileData = await streamToString(getRes.Body);
    const campaignsByUser = JSON.parse(fileData);
    
    // Flatten all campaigns from all users into a single array
    const allCampaigns = [];
    Object.keys(campaignsByUser).forEach(username => {
      const userCampaigns = campaignsByUser[username];
      if (Array.isArray(userCampaigns)) {
        // Add owner info to each campaign and only include active campaigns
        userCampaigns.forEach(campaign => {
          if (campaign.status === 'active') {
            allCampaigns.push({
              ...campaign,
              owner: username
            });
          }
        });
      }
    });
    
    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify(allCampaigns)
    };
  } catch (err) {
    if (err.name === 'NoSuchKey') {
      return { 
        statusCode: 200, 
        headers,
        body: JSON.stringify([])
      };
    }
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ message: 'Error loading campaigns: ' + err.message })
    };
  }
}; 