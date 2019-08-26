const { Genre } = require('./models/genre');
const { Review } = require('./models/review');
const mongoose = require('mongoose');
const config = require('config');

const data = [
  {
    name: 'Comedy',
    reviews: [
      { title: 'Airplane' },
      { title: 'The Hangover' },
      { title: 'Wedding Crashers' }
    ]
  },
  {
    name: 'Action',
    reviews: [
      { title: 'Die Hard' },
      { title: 'Terminator' },
      { title: 'The Avengers' }
    ]
  },
  {
    name: 'Romance',
    reviews: [
      { title: 'The Notebook' },
      { title: 'When Harry Met Sally' },
      { title: 'Pretty Woman' }
    ]
  },
  {
    name: 'Thriller',
    reviews: [
      { title: 'The Sixth Sense' },
      { title: 'Gone Girl' },
      { title: 'The Others' }
    ]
  }
];

async function seed() {
  await mongoose.connect(config.get('db'));

  await Review.deleteMany({});
  await Genre.deleteMany({});

  for (let genre of data) {
    const { _id: genreId } = await new Genre({ name: genre.name }).save();
    const reviews = genre.reviews.map(review => ({
      ...review,
      genre: { _id: genreId, name: genre.name }
    }));
    await Review.insertMany(reviews);
  }

  mongoose.disconnect();

  console.info('Done!');
}

seed();
