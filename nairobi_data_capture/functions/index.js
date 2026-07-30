const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Mock Africa's Talking API for MVP without direct credentials initially
// const africastalking = require('africastalking');

admin.initializeApp();
const db = admin.firestore();

// --- Constants ---
const MIN_ENTRIES_TO_QUALIFY = 10;
const ENTRIES_PER_REWARD_UNIT = 100;
const REWARD_AMOUNT_KES = 10;
const DAILY_ENTRY_CAP = 100;

// Nairobi Bounding Box (Approximate)
const NAIROBI_BBOX = {
  minLat: -1.45,
  maxLat: -1.15,
  minLng: 36.65,
  maxLng: 37.10
};

// --- R2 Configuration ---
// In production, use functions config or Secret Manager
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'mock',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'mock',
  },
});

exports.generateUploadUrl = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { extension } = data;
  const objectKey = `photos/${context.auth.uid}/${Date.now()}.${extension || 'jpg'}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || 'nairobi-data-capture',
    Key: objectKey,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  return { url, objectKey };
});

exports.onEntryCreated = functions.firestore
  .document('entries/{entryId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const uid = data.uid;
    const { lat, lng, timestamp } = data;

    // 1. Validate Bounding Box
    if (lat < NAIROBI_BBOX.minLat || lat > NAIROBI_BBOX.maxLat || lng < NAIROBI_BBOX.minLng || lng > NAIROBI_BBOX.maxLng) {
      return snap.ref.update({ status: 'rejected', reason: 'outside_nairobi' });
    }

    // 2. Validate Duplicate (within 15m and 10 mins)
    // For MVP, we skip complex geospatial queries and just query recent entries by the same user or globally.
    // Here we'll just flag if missing photo or gps.
    if (!data.lat || !data.lng || !data.r2ObjectKey) {
      return snap.ref.update({ status: 'rejected', reason: 'missing_data' });
    }

    // Update status to verified
    await snap.ref.update({ status: 'verified' });

    // 3. Update Stats & Rewards
    const dateStr = new Date().toISOString().split('T')[0];
    const dailyStatRef = db.collection('daily_stats').doc(`${uid}_${dateStr}`);
    const userRef = db.collection('users').doc(uid);

    await db.runTransaction(async (transaction) => {
      const dailyDoc = await transaction.get(dailyStatRef);
      let validCount = 1;
      let rewardsIssuedToday = 0;

      if (dailyDoc.exists) {
        validCount = (dailyDoc.data().validCount || 0) + 1;
        rewardsIssuedToday = dailyDoc.data().rewardsIssuedToday || 0;
      }

      const userDoc = await transaction.get(userRef);
      let totalEntries = 1;
      let totalAirtimeEarnedKES = 0;
      let phone = '';

      if (userDoc.exists) {
        totalEntries = (userDoc.data().totalEntries || 0) + 1;
        totalAirtimeEarnedKES = userDoc.data().totalAirtimeEarnedKES || 0;
        phone = userDoc.data().phone || '';
      }

      // Check Reward Qualification
      if (validCount <= DAILY_ENTRY_CAP && validCount % ENTRIES_PER_REWARD_UNIT === 0) {
        // Trigger Africa's Talking
        console.log(`[REWARD] Triggering KES ${REWARD_AMOUNT_KES} for ${phone}`);
        // TODO: AT Implementation
        rewardsIssuedToday += 1;
        totalAirtimeEarnedKES += REWARD_AMOUNT_KES;
      }

      transaction.set(dailyStatRef, { validCount, rewardsIssuedToday }, { merge: true });
      transaction.set(userRef, { totalEntries, totalAirtimeEarnedKES }, { merge: true });
    });
  });
