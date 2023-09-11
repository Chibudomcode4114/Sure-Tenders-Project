const mongoose = require('mongoose')
const dotenv = require('dotenv')


process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting Down App...');
  console.log(err.name, err.message);
  process.exit(1);
})

dotenv.config({ path: './config.env' })
const app = require('./app')

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connections Successful!!')
    // .catch(err => console.log('ERROR'))
  });



const port = process.env.PORT || 8000
const server = app.listen(port, () => {
  console.log(`App listening on port ${port}!`, `http://localhost:${port}`)
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION!💥 Shutting Down App...');
  server.close(() => {
    process.exit(1);
  });
});