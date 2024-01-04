import { createClient } from "redis";

const client = createClient({
  no_persistence: true,
  //   password: process.env.REDIS_PASSWORD,
  //   socket: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },

  // client.configSet("no_persistence");
});
client.on("error", (err) => console.log("err", err));

if (!client.isOpen) {
  client.connect();
  console.log("redis server is connected");
}

export default client;
