import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xssSanitize from 'xss-clean';
import cookieParser from 'cookie-parser';


// Routes Imported
import index from './routes/index.js';


const app = express();

//Rate limiter.  For now 100 requests on all routes per 15 minutes.
const limiter = rateLimit({
    windowMs: 15*60*1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false
});

app.set('view engine', 'ejs');
app.set('views');

// app.use(express.static('public'));


// Middlewares
app.use(limiter);
app.use(helmet());
app.use(cookieParser());
app.use(express.json()); //Parse JSON data
app.use(express.urlencoded({ extended: false })); //Parse URL-encoded data
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
);
app.use(xssSanitize());

// Routes
app.use('/', index);

export default app;
