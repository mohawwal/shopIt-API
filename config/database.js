const mongoose = require('mongoose');
const dotenv = require('dotenv')

dotenv.config()

const connectDatabase = () => {
    mongoose.connect(process.env.MONGODB_CONNECT_URL).then(con => {
        console.log(`MongoDB database connected with HOST: ${con.connection.host}`);
    }).catch(error => {
        console.error('Error connecting to MongoDB:', error.message);
    });
};

module.exports = connectDatabase;