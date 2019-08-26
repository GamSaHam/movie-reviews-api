const express = require('express');
const genres = require('../routes/genres');
const movies = require('../routes/movies');
const customers = require('../routes/customers');
const reviews = require('../routes/reviews');
const users = require('../routes/users');
const auth = require('../routes/auth');
const error = require('../middleware/error');
const upload = require('../routes/upload');

module.exports = function(app) {
  app.use(express.json());
  app.use('/api/genres', genres);
  app.use('/api/movies', movies);
  app.use('/api/customers', customers);
  app.use('/api/reviews', reviews);
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use(error);
};
