import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Name is required'],
    min: [3, 'Name must be at least 3 characters'],
    max: [20, 'Name must be at most 20 characters'],
    trim: true,
    validate: [validator.isAlpha, 'Name must only contain letters (a-z, A-Z)'],
  },
  lastName: {
    type: String,
    required: [true, 'Name is required'],
    min: [3, 'Name must be at least 3 characters'],
    max: [20, 'Name must be at most 20 characters'],
    trim: true,
    validate: [validator.isAlpha, 'Name must only contain letters (a-z, A-Z)'],
  },
  userName: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    min: [3, 'Username must be at least 3 characters'],
    max: [30, 'Username must be at most 30 characters'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email 😒'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    min: [8, 'Password must be at least 8 characters'],
    max: [30, 'Password must be at most 30 characters'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: [
      validator.isMobilePhone,
      'Please provide a valid phone number 😒',
    ],
  },
});

const User = mongoose.model('User', userSchema);

export default User;
