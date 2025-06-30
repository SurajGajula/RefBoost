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
    'Access-Control-Allow-Headers': 'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight response' })
    };
  }

  try {
    const { referralCode, userEmail, campaignId } = event.body ? JSON.parse(event.body) : event;
    
    if (!referralCode || !userEmail) {
      return { 
        statusCode: 400, 
        headers,
        body: JSON.stringify({ message: 'Missing referralCode or userEmail' })
      };
    }

    console.log('Processing conversion for:', { referralCode, userEmail, campaignId });
    
    // Load current codes data
    let codesData = {};
    try {
      const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CODES_KEY }));
      const fileData = await streamToString(getRes.Body);
      codesData = JSON.parse(fileData);
    } catch (err) {
      if (err.name === 'NoSuchKey') {
        return { 
          statusCode: 404, 
          headers,
          body: JSON.stringify({ message: 'No referral codes found' })
        };
      }
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ message: 'Error loading codes: ' + err.message })
      };
    }

    // Find the referral code and affiliate
    let affiliateEmail = null;
    let referralCodeData = null;
    
    for (const username in codesData) {
      if (Array.isArray(codesData[username])) {
        const code = codesData[username].find(c => c.code === referralCode);
        if (code) {
          affiliateEmail = username;
          referralCodeData = code;
          break;
        }
      }
    }

    if (!referralCodeData || !affiliateEmail) {
      return { 
        statusCode: 404, 
        headers,
        body: JSON.stringify({ message: 'Referral code not found' })
      };
    }

    // Update affiliate's referral code with conversion
    referralCodeData.conversions = (referralCodeData.conversions || 0) + 1;
    referralCodeData.lastConversion = new Date().toISOString();
    
    // Add referee information
    if (!referralCodeData.referees) {
      referralCodeData.referees = [];
    }
    referralCodeData.referees.push({
      email: userEmail,
      convertedAt: new Date().toISOString(),
      status: 'completed'
    });

    // Save updated codes data
    try {
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: CODES_KEY,
        Body: JSON.stringify(codesData, null, 2),
        ContentType: 'application/json',
      }));
      console.log('Updated affiliate codes data');
    } catch (err) {
      console.error('Error saving codes data:', err);
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ message: 'Error updating affiliate data: ' + err.message })
      };
    }

    // Now update campaign owner's data
    let campaignsData = {};
    try {
      const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CAMPAIGNS_KEY }));
      const fileData = await streamToString(getRes.Body);
      campaignsData = JSON.parse(fileData);
    } catch (err) {
      if (err.name === 'NoSuchKey') {
        console.log('No campaigns file found, skipping campaign update');
        return { 
          statusCode: 200, 
          headers,
          body: JSON.stringify({ message: 'Conversion tracked for affiliate only' })
        };
      }
      console.error('Error loading campaigns:', err);
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ message: 'Error loading campaigns: ' + err.message })
      };
    }

    // Find and update the campaign
    let campaignFound = false;
    const targetCampaignId = campaignId || referralCodeData.campaignId;
    
    for (const owner in campaignsData) {
      if (Array.isArray(campaignsData[owner])) {
        const campaign = campaignsData[owner].find(c => c.id === targetCampaignId);
        if (campaign) {
          // Initialize referrals array if it doesn't exist
          if (!campaign.referrals) {
            campaign.referrals = [];
          }

          // Find or create referral entry for this affiliate
          let affiliateReferral = campaign.referrals.find(r => r.affiliate === affiliateEmail);
          if (!affiliateReferral) {
            affiliateReferral = {
              affiliate: affiliateEmail,
              referees: []
            };
            campaign.referrals.push(affiliateReferral);
          }

          // Add the new referee
          affiliateReferral.referees.push({
            email: userEmail,
            convertedAt: new Date().toISOString(),
            status: 'completed',
            referralCode: referralCode
          });

          // Update campaign totals
          campaign.totalSignups = (campaign.totalSignups || 0) + 1;
          
          // Add participant if not already added
          if (!campaign.participants) {
            campaign.participants = [];
          }
          if (!campaign.participants.includes(affiliateEmail)) {
            campaign.participants.push(affiliateEmail);
          }

          campaignFound = true;
          console.log('Updated campaign:', campaign.id, 'for owner:', owner);
          break;
        }
      }
    }

    if (campaignFound) {
      // Save updated campaigns data
      try {
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: CAMPAIGNS_KEY,
          Body: JSON.stringify(campaignsData, null, 2),
          ContentType: 'application/json',
        }));
        console.log('Updated campaign owner data');
      } catch (err) {
        console.error('Error saving campaigns data:', err);
        return { 
          statusCode: 500, 
          headers,
          body: JSON.stringify({ message: 'Error updating campaign data: ' + err.message })
        };
      }
    } else {
      console.log('Campaign not found for ID:', targetCampaignId);
    }

    return { 
      statusCode: 200, 
      headers,
      body: JSON.stringify({ 
        message: 'Conversion tracked successfully',
        affiliate: affiliateEmail,
        campaign: targetCampaignId,
        conversions: referralCodeData.conversions
      })
    };

  } catch (error) {
    console.error('Error processing conversion:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error: ' + error.message })
    };
  }
}; 