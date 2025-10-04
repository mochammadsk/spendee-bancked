const mongoose = require('mongoose');
require('dotenv').config();

let cached =
  global._mongoose || (global._mongoose = { conn: null, promise: null });
async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
module.exports = { connectDB };
