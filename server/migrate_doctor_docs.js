/**
 * migrate_doctor_docs.js
 * 
 * One-time script: uploads a real sample document to YOUR Cloudinary account
 * and updates every seeded doctor profile in the DB with that permanent URL.
 * 
 * Run once from server/ directory:
 *   node migrate_doctor_docs.js
 */

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DEMO_PLACEHOLDER_REGEX = /res\.cloudinary\.com\/demo/;

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const { default: DoctorProfile } = await import('./src/models/DoctorProfile.model.js');

  // Upload a stable sample image to YOUR Cloudinary account
  console.log('Uploading sample document to your Cloudinary account...');
  const result = await cloudinary.uploader.upload(
    'https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg',
    {
      folder: 'doctor_docs',
      public_id: 'theralign_sample_doc',
      overwrite: true,
      resource_type: 'image',
    }
  );
  const sampleUrl = result.secure_url;
  console.log('Uploaded. Permanent URL:', sampleUrl);

  // Update all profiles using any res.cloudinary.com/demo URL
  const all = await DoctorProfile.find({
    $or: [
      { degreeDocument: { $regex: 'res.cloudinary.com/demo' } },
      { licenseDocument: { $regex: 'res.cloudinary.com/demo' } },
    ]
  });

  console.log(`Found ${all.length} profiles to update...`);

  for (const doc of all) {
    if (DEMO_PLACEHOLDER_REGEX.test(doc.degreeDocument)) doc.degreeDocument = sampleUrl;
    if (DEMO_PLACEHOLDER_REGEX.test(doc.licenseDocument)) doc.licenseDocument = sampleUrl;
    await doc.save();
  }

  console.log(`Done. Updated ${all.length} doctor profiles.`);
  console.log('\nCopy this URL into seedDoctors.js to replace all demo placeholders:');
  console.log(sampleUrl);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
