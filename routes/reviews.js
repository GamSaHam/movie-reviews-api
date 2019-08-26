const { Review, validate } = require('../models/review');
const { Movie } = require('../models/movie');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const moment = require('moment');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const reviews = await Review.find()
    .select('-__v')
    .sort({ publishDate: 'desc' });
  res.send(reviews);
});

router.get('/movies/:id', async (req, res) => {
  var ObjectId = require('mongoose').Types.ObjectId;

  const reviews = await Review.find({
    'movie._id': new ObjectId(req.params.id)
  })
    .select('-__v')
    .sort({ views: -1 })
    .limit(3);

  res.send(reviews);
});

router.get('/recent', async (req, res) => {
  const reviews = await Review.find()
    .select('-__v')
    .sort({ publishDate: 'desc' })
    .limit(5);

  res.send(reviews);
});

router.get('/best', async (req, res) => {
  const reviews = await Review.find()
    .select('-__v')
    .sort({ views: 'desc' })
    .limit(5);

  res.send(reviews);
});

router.post('/search', async (req, res) => {
  const { search, category, page } = req.body;

  let query = {};
  if (search === '') {
    query = {};
  } else if (category === 'name') {
    query = {
      'movie.name': { $regex: search }
    };
  } else if (category === 'title') {
    query = {
      title: { $regex: search }
    };
  } else if (category === 'writer') {
    query = {
      userName: { $regex: search }
    };
  }

  const reviews = await Review.find(query)
    .select('-__v')
    .sort({ publishDate: 'desc' });

  res.send(reviews);
});

router.post('/', [auth], async (req, res) => {
  const { error } = validate(req.body);
  console.log(error);
  if (error) return res.status(400).send(error.details[0].message);

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Invalid movie.');

  const review = new Review({
    movie: {
      _id: movie._id,
      name: movie.name
    },
    title: req.body.title,
    rating: req.body.rating,
    content: req.body.content,
    publishDate: moment().toJSON(),
    userId: req.body.userId,
    userName: req.body.userName,
    views: req.body.views
  });

  await review.save();

  res.send(review);
});

router.put('/:id', [auth], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Invalid movie.');

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      movie: {
        _id: movie._id,
        name: movie.name
      },
      title: req.body.title,
      rating: req.body.rating,
      content: req.body.content,
      userId: req.body.userId,
      userName: req.body.userName,
      views: req.body.views
    },
    { new: true }
  );

  if (!review)
    return res.status(404).send('The review with the given ID was not found.');

  res.send(review);
});

router.delete('/search/:page', [auth], async (req, res) => {
  console.log(req.body);
});

router.delete('/:id', [auth], async (req, res) => {
  const review = await Review.findByIdAndRemove(req.params.id);

  if (!review)
    return res.status(404).send('The review with the given ID was not found.');

  res.send(review);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const review = await Review.findById(req.params.id).select('-__v');

  if (!review)
    return res.status(404).send('The review with the given ID was not found.');

  const update_reviews = await Review.findByIdAndUpdate(
    review._id,
    {
      views: review.views + 1
    },
    { new: true }
  );

  review.views = review.views + 1;

  if (!update_reviews) return res.status(404).send('The Views has error');

  res.send(review);
});

module.exports = router;
