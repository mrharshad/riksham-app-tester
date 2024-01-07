import { createServer } from "http";
import { Server } from "socket.io";
import client from "@/backend/config/redisConnect";
export const config = {
  api: {
    bodyParser: false,
  },
};
const PORT = 5000;

export async function GET(req) {
  console.log("Starting Socket.IO server on port:", PORT);
  const httpServer = createServer();
  const io = new Server(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*", methods: ["POST", "GET"] },
  }).listen(PORT);

  io.on("connect", (socket) => {
    console.log("socket", socket.id);
    socket.on("userData", async (data, callback) => {
      console.log("userData event run");
      let user = await client.hgetall(`user:${data}`);
      if (!user) {
        user = { fName: "harshad", lName: "sahu" };
        await client.hset(`user:${data}`, user);
        await client.expire(`user:${data}`, 30);

        user = result;
      }
      callback(user);
    });
    socket.on("disconnect", async () => {
      console.log("socket disconnect ");
    });
  });

  return new Response(
    JSON.stringify({
      success: true,
      message: "Socket is started",
      socket: `:${PORT}`,
    }),
    {
      status: 201,
    }
  );
}

// npm run dev
// git add .
// git commit -m "new"
// git push riksham-app-tester master
