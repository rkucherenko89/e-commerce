const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const { UnauthenticatedError } = require('../errors/index')


const UserSchema = mongoose.Schema({
  name: {
    type: String,
    requred: [true, 'name__required'],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    requred: [true, 'email__required'],
    validator: {
      validator: validator.isEmail,
      message: 'email__invalid'
    },
    unique: true
  },
  password: {
    type: String,
    required: [true, 'password__required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
})

UserSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }
})

UserSchema.methods.verifyPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

UserSchema.statics.authenticate = async function (email, candidatePassword) {
  const user = await this.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('email__invalid')
  }
  const isPasswordValid = await user.verifyPassword(candidatePassword)
  if (!isPasswordValid) {
    throw new UnauthenticatedError('password__invalid')
  }
  return user
}


module.exports = mongoose.model('User', UserSchema)
