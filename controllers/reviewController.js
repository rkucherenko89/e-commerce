const Review = require('../models/Review')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const { NotFoundError, BadRequestError } = require('../errors')
const { checkPermissions } = require('../utils')


const createReview = async (req, res) => {
  const { product: productId } = req.body
  const isValidProduct = await Product.findById(productId)
  if (!isValidProduct) {
    throw new NotFoundError(`No product with ID ${productId}`)
  }
  const isAlreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId
  })
  if (isAlreadySubmitted) {
    throw new BadRequestError('Only one review per product is available')
  }
  req.body.user = req.user.userId
  const review = await Review.create(req.body)
  res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: 'product',
    select: 'name company price'
  })
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews })
}

const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findById(reviewId)
  if (!review) {
    throw new NotFoundError(`No review with ID ${reviewId}`)
  }
  res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params
  const { rating, title, comment } = req.body
  const review = await Review.findById(reviewId)
  if (!review) {
    throw new NotFoundError(`No review with ID ${reviewId}`)
  }
  checkPermissions(req.user, review.user)
  review.rating = rating
  review.title = title // title && (review.title = title)
  review.comment = comment
  await review.save()
  res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params
  const review = await Review.findById(reviewId)
  if (!review) {
    throw new NotFoundError(`No review with ID ${reviewId}`)
  }
  checkPermissions(req.user, review.user)
  await Review.deleteOne({ _id: reviewId })
  await Review.calculateAverageRating(review.product)
  res.status(StatusCodes.NO_CONTENT).send()
}

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params
  const reviews = await Review.find({ product: productId })
  res.status(StatusCodes.OK).json({ count: reviews.length, reviews })
}


module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews
}
