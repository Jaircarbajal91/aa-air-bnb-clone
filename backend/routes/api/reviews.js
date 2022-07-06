const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, User, Review, Image, sequelize } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const user = require('../../db/models/user');


router.get('/auth', requireAuth, async (req, res) => {
  const {id} = req.user;

  const reviews = await Review.findAll({
    include: [
      {
        model: Spot
      },
      {
        model: Image
      }
    ],
    where: {
      userId: id
    }
  })
  res.json(reviews)
})


module.exports = router;
