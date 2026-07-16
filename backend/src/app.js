require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/media', require('./routes/media.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));

// Proxy S3 requests through the Express server (port 4000) to bypass firewall blocks on port 4568
const http = require('http');
app.use('/s3-proxy', (req, res) => {
  const s3Url = 'http://localhost:4568' + req.url;
  http.get(s3Url, (s3Res) => {
    res.writeHead(s3Res.statusCode, s3Res.headers);
    s3Res.pipe(res);
  }).on('error', (err) => {
    res.status(500).send(err.message);
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

module.exports = app;
