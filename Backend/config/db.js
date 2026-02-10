const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/rentnest';

  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    console.warn('⚠️  No MONGO_URI or MONGODB_URI in .env — using default local MongoDB');
  }

  if (mongoURI.includes('YOURPASSWORD') || mongoURI.includes('<password>') || mongoURI.includes('REAL_PASSWORD')) {
    console.error('❌ Invalid MONGO_URI: Replace REAL_PASSWORD in Backend/.env with your real MongoDB Atlas database user password, then restart the server.');
    console.error('   If password has special characters (e.g. #, @, %), URL-encode them.');
    return;
  }

  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    console.log('MongoDB Connected Successfully');
    console.log(`✅ Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('\n💡 querySrv ENOTFOUND means the cluster hostname in MONGO_URI is wrong or does not exist.');
      console.error('   Fix: Get the exact connection string from MongoDB Atlas:');
      console.error('   1. Log in to https://cloud.mongodb.com/');
      console.error('   2. Your Cluster → Connect → Drivers → Node.js');
      console.error('   3. Copy the connection string (it has a unique host like cluster0.XXXXX.mongodb.net)');
      console.error('   4. In .env set MONGO_URI=<paste that string>');
      console.error('   5. Replace <password> with your database user password (URL-encode special characters)');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Check MongoDB username and password in .env. URL-encode special characters in password.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 For local MongoDB, ensure mongod is running or use Atlas MONGO_URI from Atlas.');
    }

    console.error('\n⚠️  Server will continue without database; some features may not work.\n');
  }
};

module.exports = connectDB;

