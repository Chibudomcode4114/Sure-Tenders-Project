const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tenderRouter = require('./routes/tenderRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewsRouter = require('./routes/viewsRoutes')

const app = express()

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'))

// 1) GLOBAL MIDDLEWARE
// Serving static files
// app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, 'public')))

// Set security HTTP headers. 
app.use(helmet())

// Use helmet with CSP settings
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
        },
    })
);

// // Having an issue with my content security policy, Added this to see if it would help.
// // Add your custom Content Security Policy (CSP) header
// // Here's an example allowing resources from 'self', 'ws://localhost:59388', and 'http://127.0.0.1:8000'
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: ["'self'"],
//             connectSrc: ["'self'", "ws://localhost:59388", "http://127.0.0.1:8000"],
//         },
//     })
// );

// Remember to take this out!!
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

/**
 * Rate limiter middleware to limit the number of requests from an IP address.
 * It restricts the number of requests to a maximum of 'max' requests per 'windowMs' milliseconds.
 * If the limit is exceeded, it sends a response with the error message.
 */
const limiter = rateLimit({
    // Maximum number of requests allowed from an IP address    max: 100,
    max: 100,
    // Time window in milliseconds for the maximum number of requests
    windowMs: 60 * 60 * 1000,
    // Error message to be sent when the limit is exceeded
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body Parser, reading data from the body into the req.body.
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());


// Date Sanitization against NoSQL Qurey Injection
app.use(mongoSanitize())

// Date Sanitization against XSS(Cross Site Scripting)
app.use(xss())

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);

app.use(compression())

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next()
})


// 3) ROUTES

app.use('/', viewsRouter)
app.use('/api/v1/tenders', tenderRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)


app.all('*', (req, res, next) => {
    next(new AppError(` Can't find ${req.originalUrl} on this server!`));
})

app.use(globalErrorHandler)

module.exports = app;
