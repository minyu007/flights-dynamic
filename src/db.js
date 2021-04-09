const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.db, {
  //  useMongoClient: true
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + config.db);
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});

process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});
