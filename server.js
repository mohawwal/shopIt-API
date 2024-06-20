const app = require('./app')
const dotenv = require('dotenv')
const connectDatabase = require('./config/database')
const cloudinary = require('cloudinary')

//Handle Uncaught Exception
process.on('uncaughtException', err => {
console.log(`ERROR: ${err.message}`)
console.log('Shutting Down Due To Uncaught Exception')
process.exit(1)
})


//setting up config file
dotenv.config({path: './config/config.env'})


//connecting to database
connectDatabase()

//setting up cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const server = app.listen(process.env.PORT, () => {
    console.log(`server running in PORT ${process.env.PORT} in ${process.env.NODE_ENV}`)
})


//handle Unhandled Promise Rejections
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`)
    console.log('Shutting Down The Server Due To Unhandled Promise Rejection')
    server.close(() => {
        process.exit(1)
    })
})