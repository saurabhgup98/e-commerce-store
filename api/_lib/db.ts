import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

// Cached-connection-singleton pattern for serverless: a warm function
// instance reuses the same connection across invocations via `global`
// instead of reconnecting every request. The URI is only read here, at call
// time, not at module load, so a build step never fails over a missing var.
export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!cached.promise) {
    // Clear the cached promise on failure so a warm instance retries on the
    // next call instead of replaying the same rejection forever (e.g. a
    // transient Atlas network-access delay).
    cached.promise = mongoose.connect(uri).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
