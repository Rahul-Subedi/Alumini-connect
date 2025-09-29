// test-query.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/database');

const runTest = async () => {
  try {
    await connectDB();
    console.log('Database connected. Running the test query...');

    // This is the exact same query your search page uses
    const query = { 'verification.status': 'verified' };
    
    console.log('Searching for users with filter:', query);

    const verifiedUsers = await User.find(query);

    console.log(`\n--- QUERY RESULTS ---`);
    console.log(`Found ${verifiedUsers.length} verified users.`);

    if (verifiedUsers.length > 0) {
      console.log("\n✅ SUCCESS: The query is working correctly and your data is fine. This means the problem is in how your server is handling the API request.");
    } else {
      console.log("\n❌ FAILURE: The query returned 0 users. This confirms the problem is with the data in your database. The users are either not there or not marked as 'verified' correctly.");
      console.log("\nACTION: Please run `npm run seed` one more time to be certain the database is populated with correct data.");
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