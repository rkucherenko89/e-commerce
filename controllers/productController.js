const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const { NotFoundError, BadRequestError } = require('../errors')
const path = require('path')


const createProduct = async (req, res) => {
  req.body.user = req.user.userId
  const product = await Product.create(req.body)
  res.status(StatusCodes.CREATED).json({ product })
}

const getAllProducts = async (req, res) => {
  const products = await Product.find()
  res.status(StatusCodes.OK).json({ count: products.length, products })
}

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params
  const product = await Product.findById(productId).populate('reviews')
  if (!product) {
    throw new NotFoundError(`No product with id ${productId}`)
  }
  res.status(StatusCodes.OK).json({ product })
}

const updateProduct = async (req, res) => {
  const { id: productId } = req.params
  const product = await Product.findByIdAndUpdate(
    productId,
    req.body,
    { new: true, runValidators: true }
  )
  if (!product) {
    throw new NotFoundError(`No product with id ${productId}`)
  }
  res.status(StatusCodes.OK).json({ product })
}

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params
  const product = await Product.findByIdAndDelete(productId)
  if (!product) {
    throw new NotFoundError(`No product with id ${productId}`)
  }
  res.status(StatusCodes.NO_CONTENT).send()
  // const { id: productId } = req.params
  // const product = await Product.findById(productId)
  // if (!product) {
  //   throw new NotFoundError(`No product with id ${productId}`)
  // }
  // await Product.deleteOne({ _id: productId })
  // res.status(StatusCodes.NO_CONTENT).send()
}

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequestError('No file')
  }
  const productImage = req.files.image
  if (!productImage.mimetype.startsWith('image')) {
    throw new BadRequestError('File should be an image')
  }
  const maxSize = 1024 * 1024
  if (productImage.size > maxSize) {
    throw new BadRequestError('File should be less than 1MB')
  }
  const imagePath = path.join(__dirname, '../public/uploads', `${productImage.name}`)
  await productImage.mv(imagePath)
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` })
}


module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage
}
