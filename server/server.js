import mongoose from 'mongoose';
import app from './index.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log('Database is connected'))
  .catch((err) => {
    console.log(`Can't connect to the database ${err}`);
  });

app.listen(process.env.PORT, 'localhost', () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
