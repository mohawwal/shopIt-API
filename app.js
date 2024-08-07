const express = require('express')
const cors = require('cors')
const app = express();

const bodyParser = require('body-parser');
const errorMiddleware = require('./middlewares/errors')

const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');

app.use(cors());
app.use(express.json({limit: '50mb'}))

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

app.use(bodyParser.urlencoded({ extended: true }))


//Import all routes
const productsRouter = require('./routes/product')
app.use('/api/v1', productsRouter)


const authRouter = require('./routes/auth')
app.use('/api/v1', authRouter)

const orderRouter = require('./routes/order');
app.use('/api/v1', orderRouter)

const paymentRouter = require('./routes/payment');
app.use('/api/v1', paymentRouter)


app.use('/api', (req, res) => {
    res.json('welcome')
})

//middlewares to handle errors
app.use(errorMiddleware);


module.exports = app