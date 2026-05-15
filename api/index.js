// This file acts as the bridge for Vercel Serverless Functions.
// Vercel automatically deploys any file inside the 'api/' folder as a serverless function.
const app = require('../backend/server.js');

module.exports = app;
