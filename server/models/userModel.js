import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  //? Required fields
  firstName: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [20, 'Name must be at most 20 characters'],
    trim: true,
    validate: [validator.isAlpha, 'Name must only contain letters (a-z, A-Z)'],
  },
  lastName: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [20, 'Name must be at most 20 characters'],
    trim: true,
    validate: [validator.isAlpha, 'Name must only contain letters (a-z, A-Z)'],
  },
  userName: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username must be at most 20 characters'],
    trim: true,
    validate: [
      validator.isAlphanumeric,
      'Username must only contain letters and numbers',
    ],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email 😒'],
    lowercase: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
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
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

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

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  //* -1 second to make sure the token is created after the password was changed
  this.passwordChangeAt = Date.now() - 1000;
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

/**
 * Check if the user's password was changed after the JWT token was issued.
 *
 * @function isChanged
 * @memberof User
 * @param {number} JWTTimestamp - The timestamp when the JWT token was issued.
 * @returns {boolean} - Returns true if the user's password was changed after the JWT token was issued, otherwise false.
 */

userSchema.methods.isChanged = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // false means NOT changed
  return false;
};

userSchema.methods.resetAndConfirmTokene = function (type) {
  //* 1) Check if the type is valid
  if (!type) throw new Error('Type is required for reset password token');
  if (type !== 'emailVerification' && type !== 'passwordReset')
    throw new Error('Invalid type for reset token');

  //* 2) Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  //* 3) Create hashed reset token to the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //* 4) Save the expiration time to the database
  const tokenField = `${type}Token`;
  const expiresField = `${type}Expires`;
  this[tokenField] = hashedToken;
  this[expiresField] = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
