const Order = require('../models/Order')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const { NotFoundError, BadRequestError } = require('../errors')
const { checkPermissions } = require('../utils')


const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'fakeClientSecret'
  return { client_secret, amount }
}

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body
  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError('No cart items provided')
  }
  if (!tax || !shippingFee) {
    throw new BadRequestError('Please provide tax and shipping fee')
  }
  let orderItems = []
  let subtotal = 0
  for (const item of cartItems) {
    const dbProduct = await Product.findById(item.product)
    if (!dbProduct) {
      throw new NotFoundError(`No product with id ${item.product}`)
    }
    const { name, image, price, _id } = dbProduct
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    }
    orderItems.push(singleOrderItem)
    subtotal += item.amount * price
  }
  const total = tax + shippingFee + subtotal
  const paymentIntent = await fakeStripeAPI({ amount: total, currency: 'usd' })
  const order = await Order.create({
    tax,
    shippingFee,
    subtotal,
    total,
    orderItems,
    user: req.user.userId,
    clientSecret: paymentIntent.client_secret
  })
  res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret })
}

const getAllOrders = async (req, res) => {
  const orders = await Order.find({})
  res.status(StatusCodes.OK).json({ count: orders.length, orders })
}

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params
  const order = await Order.findById(orderId)
  if (!order) {
    throw new NotFoundError(`No order with id ${orderId}`)
  }
  checkPermissions(req.user, order.user)
  res.status(StatusCodes.OK).json({ order })
}

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId })
  res.status(StatusCodes.OK).json({ count: orders.length, orders })
}

const updateOrder = async (req, res) => {
  const {
    params: { id: orderId },
    body: { paymentIntentId },
    user
  } = req
  const order = await Order.findById(orderId)
  if (!order) {
    throw new NotFoundError(`No order with id ${orderId}`)
  }
  checkPermissions(user, order.user)
  order.paymentIntentId = paymentIntentId
  order.status = 'paid'
  await order.save()
  res.status(StatusCodes.OK).json({ order })
}


module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder
}
