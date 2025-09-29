// seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Campaign = require('./models/campaignModel'); // ADDED
const alumniData = require('./data/alumniData');
const campaignData = require('./data/campaignData'); // ADDED
const connectDB = require('./config/database');

dotenv.config();

const importData = async () => {
    try {
        await connectDB();
        
        // Clear existing data
        await User.deleteMany();
        await Campaign.deleteMany(); // ADDED
        console.log('Existing users and campaigns cleared.');

        // Prepare and insert users
        const usersToCreate = await Promise.all(alumniData.map(async (alumnus) => {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            const emailDomain = alumnus.institute.toLowerCase().replace(/\s+/g, '') + '.edu';
            const email = `${alumnus.name.split(' ')[0].toLowerCase()}.${alumnus.batch}@${emailDomain}`;
            return { ...alumnus, email, password: hashedPassword, contact: '1234567890', verification: { status: 'verified' } };
        }));
        const createdUsers = await User.insertMany(usersToCreate);
        console.log('✅ 30 alumni users have been successfully imported!');

        // ADDED: Prepare and insert campaigns
        const adminUser = createdUsers.find(user => user.role === 'admin');
        if (!adminUser) {
            console.error('❌ Could not find an admin user to assign campaigns to. Please ensure one user in alumniData has role: "admin".');
            process.exit(1);
        }

        const campaignsToCreate = campaignData.map(campaign => {
            return { ...campaign, createdBy: adminUser._id };
        });

        await Campaign.insertMany(campaignsToCreate);
        console.log('✅ 10 campaigns have been successfully imported!');
        
        process.exit();

    } catch (error) {
        console.error(`❌ Error seeding data: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();
        await User.deleteMany();
        await Campaign.deleteMany(); // ADDED
        console.log('🔥 All user and campaign data has been destroyed!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error destroying data: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}