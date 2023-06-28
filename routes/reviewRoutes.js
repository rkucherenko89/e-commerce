const express = require('express')
const router = express.Router()
const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController')
const { authenticateUser } = require('../middleware/authentication')


// /api/v1/reviews
router.post('/',
  authenticateUser,
  createReview
)

router.get('/',
  getAllReviews
)

router.get('/:id',
  getSingleReview
)

router.patch('/:id',
  authenticateUser,
  updateReview
)

router.delete('/:id',
  authenticateUser,
  deleteReview
)


module.exports = router
