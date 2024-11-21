import express from 'express';
import morgan from 'morgan';
import productRouter from './routers/productRoutes.js';
import userRouter from './routers/userRoutes.js';
import errorController from './controllers/errorController.js';

const app = express();

//* 1) Middlewares
app.use(morgan('dev'));

app.use(express.json());

// app.use((req, res, next) => {
//   req.reqTime = new Date().toLocaleString();
//   next();
// });

//* 2) Routes
app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);

//* 3) Error Handling (Handle all unhandled routes)
app.all('*', errorController.notFoundPage);

app.use(errorController.genralError);

export default app;
