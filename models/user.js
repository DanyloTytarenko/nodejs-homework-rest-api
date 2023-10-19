const { Schema, model } = require('mongoose');
const { handleMongooseError } = require('../helpers');

const userSchema = new Schema(
  {
    password: {
      type: String,
      minlength: 8,
      match: [/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#\\$%\\^&\\*]).{8,}$/],
      required: [true, 'Set password for user'],
    },
    email: {
      type: String,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        'Please enter a valid email',
      ],
      required: [true, 'Email is required'],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    token: String,
  },
  { versionKey: false },
);

userSchema.post('save', handleMongooseError);

const User = model('user', userSchema);

module.exports = User;
