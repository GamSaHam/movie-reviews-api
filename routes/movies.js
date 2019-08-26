const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Movie, validate } = require('../models/movie');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const moment = require('moment');
router.get('/', async (req, res) => {
  const movies = await Movie.find()
    .select('-__v')
    .sort('name');
  res.send(movies);
});

router.get('/best', async (req, res) => {
  let year = moment().format('YYYY');
  let month = moment().format('MM');

  const movies = await Movie.aggregate([
    {
      $match: {
        release_date: {
          $gte: new Date(year + '-' + month + '-01T00:00:00.000Z'),
          $lt: new Date(year + '-' + month + '-31T00:00:00.000Z')
        }
      }
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'movie._id',
        as: 'reviews'
      }
    },
    { $unwind: { path: '$reviews', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        image_path: { $first: '$image_path' },
        total: { $avg: '$reviews.rating' }
      }
    },
    { $sort: { total: -1 } },
    { $limit: 10 }
  ]);

  res.send(movies);
});

router.get('/best_views', async (req, res) => {
  let year = moment().format('YYYY');
  let month = moment().format('MM');

  const movies = await Movie.aggregate([
    {
      $match: {
        release_date: {
          $gte: new Date(year + '-' + month + '-01T00:00:00.000Z'),
          $lt: new Date(year + '-' + month + '-31T00:00:00.000Z')
        }
      }
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'movie._id',
        as: 'reviews'
      }
    },
    { $unwind: { path: '$reviews', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        image_path: { $first: '$image_path' },
        total: { $avg: '$reviews.rating' },
        total_view: { $sum: '$reviews.views' }
      }
    },
    { $sort: { total_view: -1 } },
    { $limit: 10 }
  ]);

  res.send(movies);
});

router.get('/best_recent', async (req, res) => {
  let year = moment().format('YYYY');
  let month = moment().format('MM');

  const movies = await Movie.aggregate([
    {
      $match: {
        release_date: {
          $gte: new Date(year + '-' + month + '-01T00:00:00.000Z'),
          $lt: new Date(year + '-' + month + '-31T00:00:00.000Z')
        }
      }
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'movie._id',
        as: 'reviews'
      }
    },
    { $unwind: { path: '$reviews', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        image_path: { $first: '$image_path' },
        total: { $avg: '$reviews.rating' },
        release_date: { $first: '$release_date' }
      }
    },
    { $sort: { release_date: -1 } },
    { $limit: 10 }
  ]);

  res.send(movies);
});

router.get('/top', async (req, res) => {
  let year = moment().format('YYYY');
  let month = moment().format('MM');

  const movies = await Movie.aggregate([
    {
      $match: {
        release_date: {
          $gte: new Date(year + '-' + month + '-01T00:00:00.000Z'),
          $lt: new Date(year + '-' + month + '-31T00:00:00.000Z')
        }
      }
    },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'movie._id',
        as: 'reviews'
      }
    },
    { $unwind: { path: '$reviews', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        image_path: { $first: '$image_path' },
        total: { $avg: '$reviews.rating' }
      }
    },
    { $sort: { total: -1 } },
    { $limit: 5 }
  ]);

  res.send(movies);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let movie = new Movie({ name: req.body.name });
  movie = await movie.save();

  res.send(movie);
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    {
      new: true
    }
  );

  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id).select('-__v');

  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

module.exports = router;
