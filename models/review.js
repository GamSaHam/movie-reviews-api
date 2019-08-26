const Joi = require('joi');
const mongoose = require('mongoose');
const { movieSchema } = require('./movie');

const Review = mongoose.model(
  'Reviews',
  new mongoose.Schema({
    movie: {
      type: movieSchema,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 255
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },
    content: {
      type: Object
    },
    publishDate: {
      type: Date
    },
    userId: {
      type: String
    },
    userName: {
      type: String
    },
    views: {
      type: Number
    }
  })
);

function validateReview(review) {
  const schema = {
    movieId: Joi.objectId().required(),
    title: Joi.string()
      .min(5)
      .max(50)
      .required(),
    rating: Joi.number()
      .min(0)
      .max(5)
      .required(),
    content: Joi.object(),
    publishDate: Joi.string(),
    userId: Joi.string(),
    userName: Joi.string(),
    views: Joi.number()
  };

  return Joi.validate(review, schema);
}

exports.Review = Review;
exports.validate = validateReview;
