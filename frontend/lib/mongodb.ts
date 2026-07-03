import dns from "node:dns";
import { MongoClient } from "mongodb";

// Node 18/20 on Windows sometimes tries IPv6 DNS first for the MongoDB Atlas
// SRV lookup and fails with ECONNREFUSED even when the network/DNS server is
// fine. Forcing IPv4 first fixes this — a well-known Node + Windows + Atlas issue.
dns.setDefaultResultOrder("ipv4first");

const uri = process.env.MONGODB_URI || "";

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

// Fail fast instead of retrying forever, and DON'T let a connection failure
// crash the whole Node process (e.g. DNS SRV lookup blocked by the network).
const options = {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
};

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const client = new MongoClient(uri, options);
  const promise = client.connect();

  // Attach a no-op catch here so a failed connection never becomes an
  // "unhandledRejection" (which crashes the whole dev/prod server process).
  // Callers that actually `await clientPromise` still see the real rejection
  // and can handle it locally.
  promise.catch(() => {
    if (process.env.NODE_ENV === "development") {
      global.__mongoClientPromise = undefined;
    }
  });

  return promise;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global.__mongoClientPromise) {
    global.__mongoClientPromise = createClientPromise();
  }
  clientPromise = global.__mongoClientPromise;
} else {
  clientPromise = createClientPromise();
}

export default clientPromise;