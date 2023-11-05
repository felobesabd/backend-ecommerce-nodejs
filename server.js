const path = require('path');

const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cors = require('cors')
const compression = require("compression");

const dbConnection = require("./config/database")
const mountRoute = require("./routes");
const ApiError = require("./utils/apiError");
const errorHandler = require("./middlewares/errorMiddleware");


dotenv.config({
    path: 'config.env'
})

// Connect with db
dbConnection();

// express
const app = express()

// cors
app.use(cors())
app.options('*', cors()) // include before other routes

// compress all responses
app.use(compression())

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, 'uploads')))

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
    console.log(`mode: ${process.env.NODE_ENV}`)
}

// Mount Routes
mountRoute(app)

app.all("*", (req, res, next) => {
    // const err = new Error(`Can't find this route: ${req.originalUrl}`)
    // next(err.message);
    next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400))
})

app.use(errorHandler)

const PORT = process.env.PORT || 8000;
const server =  app.listen(PORT , ()=> {
    console.log(`App running ${PORT}`)
})

process.on("unhandledRejection", (err)=> {
    console.log(`UnhandledRejection Errors: ${err.name} | ${err.message}`)
    server.close(()=> {
        console.error(`Shutting down....`);
        process.exit(1)
    })
})
