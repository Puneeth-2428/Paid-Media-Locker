const app = require('./src/app');
const connectDB = require('./src/config/db');
const { setupLocalS3 } = require('./src/config/s3');

const PORT = process.env.PORT || 4000;

// Connect to Database, then start server
connectDB().then(async () => {
  await setupLocalS3();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to DB', err);
  process.exit(1);
});
