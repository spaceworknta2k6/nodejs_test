const mongoose = require('mongoose');

let connectionPromise = null;

module.exports.connect = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 10000
    })
    .then((connection) => {
      console.log('Connect success');
      return connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error('Connect error:', error);
      throw error;
    });

  return connectionPromise;
};

