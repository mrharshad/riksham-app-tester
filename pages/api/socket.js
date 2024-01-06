import { createServer } from "http";
import { Server } from "socket.io";
import client from "@/backend/config/redisConnect";
export const config = {
  api: {
    bodyParser: false,
  },
};
const PORT = 5000;

export default async function handler(req, res, next) {
  console.log("req", req);
  console.log("Starting Socket.IO server on port:", PORT);
  const httpServer = createServer();
  const io = new Server(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*", methods: ["POST", "PUT", "GET", "DELETE"] },
  }).listen(PORT);

  io.on("connect", (socket) => {
    socket.on("userData", async (data, callback) => {
      let user = await client.hgetall(`user:${data}`);
      if (!user) {
        user = await fetch(
          `${process.env.PROTOCOL_AND_HOST}/api/admin/user/account?token=${data}
      `,
          { cache: "no-cache" }
          // { next: { revalidate: 21600 } }
        );
        const { success, message, data: result } = await user.json();

        delete result.__v;

        await client.hset(`user:${data}`, result);
        await client.expire(`user:${data}`, 86400);

        user = result;
      }
      callback(user);
    });
    socket.on("disconnect", async () => {
      console.log("socket disconnect ");
    });
  });

  res.status(201).json({
    success: true,
    message: "Socket is started",
    socket: `:${PORT}`,
  });
}
