const app = require('../src/app');
// import { expect } from 'chai';
// import supertest from 'supertest';
// import app from '../src/app';

describe('App', () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello, world!')
  })
});