// test-campaign-query.js
require('dotenv').config();
const mongoose = require('mongoose');
const Campaign = require('./models/campaignModel');
const connectDB = require('./config/database');

const runTest = async () => {
  try {
    await connectDB();
    console.log('Database connected. Running the campaign query...');

    // This is the exact query your page uses
    const query = { isActive: true };
    
    console.log('Searching for campaigns with filter:', query);

    const activeCampaigns = await Campaign.find(query);

    console.log(`\n--- QUERY RESULTS ---`);
    console.log(`Found ${activeCampaigns.length} active campaigns.`);

    if (activeCampaigns.length > 0) {
      console.log("\n✅ SUCCESS: The query is working correctly. This means the problem is in how your web server's routes are configured.");
    } else {
      console.log("\n❌ FAILURE: The query returned 0 campaigns. This confirms the problem is with the database connection or the data format itself.");
    }

    mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("An error occurred during the test:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

runTest();