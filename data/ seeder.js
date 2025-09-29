// data/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const alumniData = require('./alumni.json');

// Load environment variables from .env file
dotenv.config();

// Connect to the database using the MONGO_URI from the .env file
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    // Remove existing users to prevent duplicates
    await User.deleteMany();
    console.log('Existing users deleted.');

    // Create the users from the alumni.json file
    await User.create(alumniData);
    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

// Run the script
connectDB().then(() => {
  importData();
});
```
eof

---

### **Final Terminal Commands**

Once you have replaced your `seeder.js` file with the corrected version, run these commands in a single, clean sequence from your project's root directory (`alumni-connect-pro`).

1.  **Run the seeder script:** This command will connect to your MongoDB Atlas database and populate it with the data from your `alumni.json` file.

    ```bash
    npm run seeder
    ```

2.  **Start your server:** After the seeding is complete, start your main application.

    ```bash
    npm start
    
