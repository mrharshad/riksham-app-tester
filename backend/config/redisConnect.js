import { createClient } from "@vercel/kv";

const client = createClient({
  no_persistence: true,
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
  // automaticDeserialization: false,
  // socket: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});
// client.configSet("no_persistence");
// client.on("error", (err) => console.log("err", err));

// if (!client.isOpen) {
//   client.connect();
//   console.log("redis server is connected");
// }

export default client;
