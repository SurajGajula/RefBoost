const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Readable } = require('stream');

// Configure your region and credentials as needed
const s3 = new S3Client({ region: 'us-west-2' }); // Update region if needed
const BUCKET = 'refboost'; // Set your bucket name
const CODES_KEY = 'codes.json';
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
  // Comprehensive CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight check passed' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { username, campaignId, campaignName, referralCode, originalLink } = body;

    if (!username || !campaignId || !campaignName || !referralCode) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing required fields: username, campaignId, campaignName, referralCode' })
      };
    }

    console.log('Processing campaign join:', { username, campaignId, campaignName, referralCode });

    // 1. First, store the referral code in codes.json
    let codesData = {};
    try {
      const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CODES_KEY }));
      const fileData = await streamToString(getRes.Body);
      codesData = JSON.parse(fileData);
    } catch (err) {
      if (err.name === 'NoSuchKey') {
        console.log('No codes file found, creating new one');
        codesData = {};
      } else {
        console.error('Error loading codes:', err);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ message: 'Error loading codes data: ' + err.message })
        };
      }
    }

    // Initialize user's codes array if it doesn't exist
    if (!codesData[username]) {
      codesData[username] = [];
    }

    // Check if referral code already exists
    const existingCode = codesData[username].find(code => code.code === referralCode);
    if (existingCode) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ message: 'Referral code already exists' })
      };
    }

    // Create referral data
    const referralData = {
      code: referralCode,
      campaignId: campaignId,
      campaignName: campaignName,
      originalLink: originalLink,
      affiliate: username,
      clicks: 0,
      conversions: 0,
      created: new Date().toISOString(),
      referees: []
    };

    // Add the new referral code
    codesData[username].push(referralData);

    // Save updated codes data
    try {
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: CODES_KEY,
        Body: JSON.stringify(codesData, null, 2),
        ContentType: 'application/json',
      }));
      console.log('Referral code stored successfully');
    } catch (err) {
      console.error('Error saving codes data:', err);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Error saving referral code: ' + err.message })
      };
    }

    // 2. Now update the campaign data to add the affiliate as a participant
    let campaignsData = {};
    try {
      const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CAMPAIGNS_KEY }));
      const fileData = await streamToString(getRes.Body);
      campaignsData = JSON.parse(fileData);
    } catch (err) {
      if (err.name === 'NoSuchKey') {
        console.log('No campaigns file found');
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'No campaigns data found' })
        };
      } else {
        console.error('Error loading campaigns:', err);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ message: 'Error loading campaigns data: ' + err.message })
        };
      }
    }

    // Find and update the campaign
    let campaignFound = false;
    let campaignOwner = null;

    for (const owner in campaignsData) {
      if (Array.isArray(campaignsData[owner])) {
        const campaign = campaignsData[owner].find(c => c.id === campaignId);
        if (campaign) {
          // Initialize participants array if it doesn't exist
          if (!campaign.participants) {
            campaign.participants = [];
          }

          // Add affiliate as participant if not already added
          if (!campaign.participants.includes(username)) {
            campaign.participants.push(username);
            console.log('Added', username, 'as participant to campaign', campaignId);
          } else {
            console.log('User', username, 'is already a participant in campaign', campaignId);
          }

          // Initialize referrals array if it doesn't exist
          if (!campaign.referrals) {
            campaign.referrals = [];
          }

          // Add an empty referral entry for this affiliate (will be populated when they get referrals)
          const existingReferral = campaign.referrals.find(r => r.affiliate === username);
          if (!existingReferral) {
            campaign.referrals.push({
              affiliate: username,
              referees: []
            });
            console.log('Added referral entry for', username, 'in campaign', campaignId);
          }

          campaignFound = true;
          campaignOwner = owner;
          break;
        }
      }
    }

    if (!campaignFound) {
      // Rollback: remove the referral code we just added since the campaign doesn't exist
      codesData[username] = codesData[username].filter(code => code.code !== referralCode);
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: CODES_KEY,
        Body: JSON.stringify(codesData, null, 2),
        ContentType: 'application/json',
      }));

      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Campaign not found' })
      };
    }

    // Save updated campaigns data
    try {
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: CAMPAIGNS_KEY,
        Body: JSON.stringify(campaignsData, null, 2),
        ContentType: 'application/json',
      }));
      console.log('Campaign data updated successfully');
    } catch (err) {
      console.error('Error saving campaigns data:', err);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Error updating campaign data: ' + err.message })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Successfully joined campaign',
        campaignId: campaignId,
        campaignName: campaignName,
        referralCode: referralCode,
        campaignOwner: campaignOwner,
        referralLink: `https://main.djpzpkogjgu28.amplifyapp.com/track.html?code=${referralCode}`
      })
    };

  } catch (error) {
    console.error('Error processing campaign join:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error: ' + error.message })
    };
  }
}; 