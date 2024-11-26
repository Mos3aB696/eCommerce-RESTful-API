import mongoose from 'mongoose';
import app from './index.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose
  .connect(process.env.DATABASE)
  // eslint-disable-next-line no-console
  .then(() => console.log('Database is connected'));

const server = app.listen(process.env.PORT, 'localhost', () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${process.env.PORT}`);
});

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  // eslint-disable-next-line no-console
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
