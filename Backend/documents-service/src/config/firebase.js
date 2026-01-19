const admin = require("firebase-admin");

function initFirebase() {
  if (admin.apps.length) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const bucketName = process.env.FIREBASE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !bucketName) {
    throw new Error("Missing Firebase env vars (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY, BUCKET)");
  }

  // arregla \n en Windows/.env
  privateKey = privateKey.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    }),
    storageBucket: bucketName
  });

  return admin;
}

function getBucket() {
  const a = initFirebase();
  return a.storage().bucket();
}

module.exports = { initFirebase, getBucket };
