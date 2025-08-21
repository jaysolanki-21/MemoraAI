
const app = require('./src/app');
const connectDb = require('./src/db/config');

app.listen(3000, () => {
  connectDb();
  console.log('Server is running on port 3000');
});

