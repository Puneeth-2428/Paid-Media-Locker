const Media = require('../models/Media');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { s3, s3External } = require('../config/s3');
const sharp = require('sharp');
const crypto = require('crypto');
const NodeCache = require('node-cache');

const feedCache = new NodeCache({ stdTTL: 30, useClones: false }); // Cache for 30 seconds
const BUCKET_NAME = 'paid-media-bucket';

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image' });
    }

    const price = parseInt(req.body.price, 10);
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    const uniqueId = crypto.randomUUID();
    const originalKey = `originals/${uniqueId}-${req.file.originalname}`;
    const previewKey = `previews/${uniqueId}-preview.jpg`;

    // 1. Upload Original to S3
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: originalKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }).promise();

    // 2. Generate Preview (blur & watermark)
    const previewBuffer = await sharp(req.file.buffer)
      .resize(800, 600)
      .blur(25)
      .composite([{
        input: Buffer.from('<svg width="800" height="600"><text x="50%" y="50%" text-anchor="middle" font-size="60" fill="rgba(255,255,255,0.7)" font-weight="bold">LOCKED</text></svg>'),
        gravity: 'center'
      }])
      .jpeg({ quality: 60 })
      .toBuffer();

    // 3. Upload Preview to S3 (In a real app, this might have public-read ACL)
    await s3.putObject({
      Bucket: BUCKET_NAME,
      Key: previewKey,
      Body: previewBuffer,
      ContentType: 'image/jpeg',
    }).promise();

    // 4. Save to DB
    const media = await Media.create({
      owner: req.user._id,
      price,
      originalKey,
      previewKey
    });

    feedCache.del("allMedia"); // Invalidate cache

    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    let mediaList = feedCache.get("allMedia");
    if (mediaList == undefined) {
      mediaList = await Media.find()
        .populate('owner', 'name')
        .sort('-createdAt');
      feedCache.set("allMedia", mediaList);
    }
    
    const feed = mediaList.map(m => {
      const isOwner = m.owner._id.toString() === req.user._id.toString();
      const isUnlocked = req.user.unlockedMedia.includes(m._id);
      
      // Generate public URL for preview
      const baseUrl = process.env.S3_PUBLIC_HOST || 'http://localhost:4568';
      const previewUrl = `${baseUrl}/${BUCKET_NAME}/${m.previewKey}`;
      
      let originalUrl = null;
      if (isOwner || isUnlocked) {
        originalUrl = s3External.getSignedUrl('getObject', {
          Bucket: BUCKET_NAME,
          Key: m.originalKey,
          Expires: 3600 // 1 hour for feed
        });
      }

      return {
        _id: m._id,
        owner: m.owner.name,
        price: m.price,
        previewUrl,
        originalUrl,
        status: isOwner || isUnlocked ? 'unlocked' : 'locked',
        createdAt: m.createdAt
      };
    });

    res.json(feed);
  } catch (error) {
    console.error('getFeed Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const mongoose = require('mongoose');

exports.unlockMedia = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const media = await Media.findById(req.params.id).session(session);
    if (!media) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Media not found' });
    }

    if (req.user.unlockedMedia.includes(media._id) || media.owner.toString() === req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Already unlocked or you are the owner' });
    }

    if (req.user.walletBalance < media.price) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Insufficient coins in wallet' });
    }

    // Deduct balance from buyer and add to unlocked list
    req.user.walletBalance -= media.price;
    req.user.unlockedMedia.push(media._id);
    await req.user.save({ session });

    // Add balance to the media owner
    await User.findByIdAndUpdate(media.owner, {
      $inc: { walletBalance: media.price }
    }, { session });

    // Create transaction log
    await Transaction.create([{
      buyer: req.user._id,
      seller: media.owner,
      media: media._id,
      amount: media.price,
      type: 'purchase'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Unlocked successfully', balance: req.user.walletBalance });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};

exports.getAccessUrl = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media not found' });

    const isOwner = media.owner.toString() === req.user._id.toString();
    const isUnlocked = req.user.unlockedMedia.includes(media._id);

    if (!isOwner && !isUnlocked) {
      return res.status(403).json({ error: 'Unauthorized. Please unlock first.' });
    }

    // Generate pre-signed URL valid for 60 seconds with correct Host signature
    const signedUrl = s3External.getSignedUrl('getObject', {
      Bucket: BUCKET_NAME,
      Key: media.originalKey,
      Expires: 60 
    });

    res.json({ originalUrl: signedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
