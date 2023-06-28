const express = require('express')
const router = express.Router()
const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword
} = require('../controllers/userController')
const {
  authenticateUser,
  authorizePermissions
} = require('../middleware/authentication')


// /api/v1/users/
router.get('/',
  authenticateUser,
  authorizePermissions('admin'),
  getAllUsers
)

router.get('/showMe',
  authenticateUser,
  showCurrentUser
)

router.patch('/updateUser',
  authenticateUser,
  updateUser
)

router.patch('/updateUserPassword',
  authenticateUser,
  updateUserPassword
)

router.get('/:id',
  authenticateUser,
  getSingleUser
)


module.exports = router
