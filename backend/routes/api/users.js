const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const e = require('express');

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];


router.post(
  '/signup',
  checkRequiredFields,
  validateSignup,
  async (req, res) => {
    const err = {
      "message": "User already exists",
      "statusCode": 403,
      "errors": {}
    }
    const { email, password, username, firstName, lastName } = req.body;
    const existingUser = await User.findOne({
      where: {
        email
      }
    })
    if (existingUser) {
      err.errors.email = "User with that email already exists"
      return res.status(403).json(err)
    }
    const user = await User.signup({ email, username, password, firstName, lastName });

    const token = await setTokenCookie(res, user);
    user.token = token
    await user.save();
    return res.json({
      "id": user.id,
      firstName,
      lastName,
      email,
      username,
      token
    });
  }
);

router.get('/auth', requireAuth, async (req, res) => {
  const id = req.user.id;

  const user = await User.findByPk(id, {
    attributes: ['id', 'firstName', 'lastName', 'email']
  })
  res.json(user)
})

function checkRequiredFields(req, res, next) {
  const { firstName, lastName, email, password, username } = req.body;

  const error = {
    message: "Validation error",
    statusCode: 400,
    errors: {}
  }

  if (!firstName) error.errors.firstName = "First Name is required"
  if (!lastName) error.errors.lastName = "Last Name is required"
  if (!email) error.errors.email = "Email is required"
  if (!password) error.errors.password = "Password is required"
  if (!username) error.errors.username = "Username is required"

  if (!firstName || !lastName || !email || !password || !username) {
    res.statusCode = 400;
    return res.json(error)
  }
  next()
}

module.exports = router;
