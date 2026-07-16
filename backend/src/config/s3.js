const AWS = require('aws-sdk');
const S3rver = require('s3rver');
const fs = require('fs');
const path = require('path');

// Internal client for uploading
const s3 = new AWS.S3({
  accessKeyId: 'S3RVER',
  secretAccessKey: 'S3RVER',
  endpoint: 'http://localhost:4568',
  s3ForcePathStyle: true,
  signatureVersion: 'v4', 
});

// External client strictly for generating pre-signed URLs for mobile devices
const s3External = new AWS.S3({
  accessKeyId: 'S3RVER',
  secretAccessKey: 'S3RVER',
  endpoint: process.env.S3_PUBLIC_HOST || 'http://localhost:4568',
  s3ForcePathStyle: true,
  signatureVersion: 'v4', 
});

// Setup local s3rver for development
const setupLocalS3 = async () => {
  const s3Dir = path.join(__dirname, '../../storage');
  if (!fs.existsSync(s3Dir)) {
    fs.mkdirSync(s3Dir, { recursive: true });
  }

  const instance = new S3rver({
    port: 4568,
    address: '0.0.0.0',
    silent: false,
    directory: s3Dir,
  });

  instance.run(async (err, { address, port } = {}) => {
    if (err) {
      console.error('S3rver error', err);
      return;
    }
    console.log(`Local S3rver running at http://${address}:${port}`);
    
    // Ensure bucket exists
    try {
      await s3.createBucket({ Bucket: 'paid-media-bucket' }).promise();
      console.log('Bucket "paid-media-bucket" created/ready');
    } catch (e) {
      if (e.code !== 'BucketAlreadyExists' && e.code !== 'BucketAlreadyOwnedByYou') {
        console.error('Error creating bucket:', e);
      }
    }
  });
};

module.exports = { s3, s3External, setupLocalS3 };
