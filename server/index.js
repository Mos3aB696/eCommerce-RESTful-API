import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';
import compression from 'compression';
import sanitizeInput from './middlewares/sanitizeInput.js';
import productRouter from './routers/productRoutes.js';
import categoryController from './routers/categoryRoutes.js';
import userRouter from './routers/userRoutes.js';
import errorController from './controllers/errorController.js';

const app = express();

//* 1) Global Middlewares

//! Set security HTTP headers
app.use(helmet());

// ! Development logging
if (!process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// console.log(process.env);

// ! Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour!',
});
app.use('/api', limiter);

// ! Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// ! Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// ! Data sanitization against XSS
app.use(sanitizeInput);

// ! Prevent parameter pollution => [?sort=price&sort=name]
app.use(hpp());

// ! Enable CORS for all requests
app.use(cors());

// ! Compress all responses
app.use(compression());

//* 2) Routes
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryController);

//* 3) Error Handling (Handle all unhandled routes)
app.all('*', errorController.notFoundPage);

app.use(errorController.genralError);

export default app;
