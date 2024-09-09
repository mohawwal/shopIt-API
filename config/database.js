const mongoose = require('mongoose');
const dotenv = require('dotenv')

dotenv.config()

const connectDatabase = () => {
    mongoose.connect(process.env.DB_LOCAL_URI).then(con => {
        console.log(`MongoDB database connected with HOST: ${con.connection.host}`);
    }).catch(error => {
        console.error('Error connecting to MongoDB:', error.message);
    });
};

module.exports = connectDatabase;