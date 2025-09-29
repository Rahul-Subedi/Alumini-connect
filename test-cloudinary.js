// test-cloudinary.js
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log("Attempting to configure Cloudinary...");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "Loaded" : "MISSING!");
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Loaded" : "MISSING!");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Loaded" : "MISSING!");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("\nTesting Cloudinary connection...");

cloudinary.api.ping()
  .then(result => {
    if (result.status === 'ok') {
        console.log("\n✅ SUCCESS! Your Cloudinary credentials are correct.");
    } else {
        console.log("\n❌ FAILURE! The ping was not successful. Result:", result);
    }
  })
  .catch(error => {
    console.error("\n❌ ERROR! The connection failed. This confirms your credentials in the .env file are incorrect.");
    console.error("Cloudinary Error:", error.message);
  });