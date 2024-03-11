import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import errors from "@/backend/utils/errorHandler";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
// api apply - /admin/user/product/buy
export async function PUT(req) {
  try {
    const { token, orderId, cancelR } = await req.json();
    const _id = jwt.verify(token, process.env.JWT_SECRET_CODE)?._id;
    if (cancelR.length > 100) {
      throw new Error("order cancellation failed");
    }
    dbConnect();
    const findUser = await User.findOne({ _id });
    if (!findUser) {
      throw new Error("order cancellation failed");
    }
    let { newOrder } = findUser;
    let findOrder;
    newOrder = newOrder.filter((order) => {
      if (order?._id === +orderId) {
        findOrder = order;
      } else {
        return order;
      }
    });

    if (!findOrder || findOrder.status === "out for delivery") {
      throw new Error("order cancellation failed");
    }

    findOrder.status = undefined;
    findOrder.cancelR = cancelR;
    findOrder.statusUP = Date.now();

    findUser.newOrder = newOrder;

    findUser.canceled.unshift(findOrder);
    await findUser.save();
    cookies().set({
      name: "userInfoRevalidate",
      value: Math.floor(Math.random() * 999999).toString(),
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      path: "/",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "order cancellation successful",
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return errors(error, 200);
  }
}
