import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  //? Required fields
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
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    min: [8, 'Password must be at least 8 characters'],
    max: [30, 'Password must be at most 30 characters'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // ! This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same 😒',
    },
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: [
      validator.isMobilePhone,
      'Please provide a valid phone number 😒',
    ],
  },
  //? Optional fields
  photo: {
    type: String,
  },
});

/**
 * * This is a Mongoose Middleware
 *? Use This to hash the password before saving it to the database
 *? It works after the validation and before saving it to the database => This is amazing 😍
 */
userSchema.pre('save', async function (next) {
  //* Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  //* Create salt and hash
  this.password = await bcrypt.hash(this.password, 12);
  //* Set it here to undefined (use it to make sure the password correct) so it doesn't persist in the database
  this.confirmPassword = undefined;
  next();
});

/**
 * Compare the input password with the user's stored password.
 *
 * @function correctPassword
 * @memberof User
 * @param {string} inputPassword - The password provided by the user for authentication.
 * @param {string} userPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the passwords match, otherwise false.
 */

userSchema.methods.correctPassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

const User = mongoose.model('User', userSchema);

export default User;
