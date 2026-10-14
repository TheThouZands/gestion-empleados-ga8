import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  return mongoose
    .createConnection(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 })
    .asPromise();
}
