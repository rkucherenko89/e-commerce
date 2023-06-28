const { NotFoundError, BadRequestError, UnauthenticatedError } = require('../errors')
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { createTokenUser, attachCookiesToResponse, checkPermissions } = require('../utils')


const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password')
  res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
  const { id: userId } = req.params
  const user = await User.findById(userId).select('-password')
  if (!user) {
    throw new NotFoundError('user__notFound')
  }
  checkPermissions(req.user, user._id)
  res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user })
}

// const updateUser = async (req, res) => {
//   const { name, email } = req.body
//   if (!name || !email) {
//     throw new BadRequestError('Please provide name and email')
//   }
//   const user = await User.findById(req.user.userId)
//   user.email = email
//   user.name = name
//   await user.save()
//   const tokenUser = createTokenUser(user)
//   attachCookiesToResponse({ res, user: tokenUser })
//   res.status(StatusCodes.OK).json({ user: tokenUser })
// }
const updateUser = async (req, res) => {
  const { name, email } = req.body
  if (!name || !email) {
    throw new BadRequestError('Please provide name and email')
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { name, email },
    { new: true, runValidators: true }
  )
  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Please provide both passwords')
  }
  const user = await User.findById(req.user.userId)
  const isPasswordValid = await user.verifyPassword(oldPassword)
  if (!isPasswordValid) {
    throw new UnauthenticatedError('password__invalid')
  }
  user.password = newPassword
  await user.save()
  res.status(StatusCodes.OK).json({ user: req.user })
}


module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword
}
