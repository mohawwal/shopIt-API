const express = require('express')
const cors = require('cors')
const app = express();

const errorMiddleware = require('./middlewares/errors')

const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');

app.use(cors());
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({extended: true, limit: '50mb'}))

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());


//Import all routes
const productsRouter = require('./routes/product')
app.use('/api/v1', productsRouter)


const authRouter = require('./routes/auth')
app.use('/api/v1', authRouter)


const orderRouter = require('./routes/order')
app.use('/api/v1', orderRouter)

//middlewares o handle errors
app.use(errorMiddleware);


module.exports = app