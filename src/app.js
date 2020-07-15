require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const winston = require('winston');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { v4: uuid } = require('uuid');

const app = express();

const bookmarks = [
  {
    id: 0,
    title: 'Google',
    url: 'http://www.google.com',
    rating: '3',
    desc: 'Internet-related services and products.'
  },
  {
    id: 1,
    title: 'Thinkful',
    url: 'http://www.thinkful.com',
    rating: '5',
    desc: '1-on-1 learning to accelerate your way to a new high-growth tech career!'
  },
  {
    id: 2,
    title: 'Github',
    url: 'http://www.github.com',
    rating: '4',
    desc: 'brings together the world\'s largest community of developers.'
  }
];

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    // logger.error(`Unauthorized request to path: ${req.path}`);
    // return res.status(401).json({ error: 'Unauthorized request' })
    console.log(authToken);
    console.log(apiToken);
  }
  // move to the next middleware
  next()
});

app.get("/bookmarks",(req, res) => {
  res.json(bookmarks);
}); 

app.get('/bookmarks/:id', (req,res) => {
  const { id } = req.params;
  const bookmark = bookmarks.find(b => b.id == id);

  // make sure we found a card
  if (!bookmark) {
    logger.error(`Bookmark with id ${id} not found.`);
    return res
      .status(404)
      .send('Bookmark Not Found');
  }

  res.json(bookmark);
});



app.post('/bookmarks', (req, res) => {
  const { title, url, desc, rating } = req.body;

  // if (!title) {
  //   logger.error('Title is required');
  //   return res
  //     .status(400)
  //     .send('Invalid data');
  // }

  // if (!url) {
  //   logger.error('URL is required');
  //   return res
  //     .status(400)
  //     .send('Invalid data');
  // }

  // if (!desc) {
  //   logger.error('Description is required');
  //   return res
  //     .status(400)
  //     .send('Invalid data');
  // }

  // if (!rating) {
  //   logger.error('Rating is required');
  //   return res
  //     .status(400)
  //     .send('Invalid data');
  // }

  const id = uuid();

  const bookmark = {
    id,
    title,
    url,
    rating,
    desc
  };
  bookmarks.push(bookmark);

  logger.info(`Bookmark with id ${id} created`);

  res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${id}`)
    .json(bookmarks);

});


app.use(function errorHandler(error, req, res, next) {
  let response;
  if(NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error);
    response = { message: error.message, error }
  }
  res.status(500).json(response);
});

module.exports = app;