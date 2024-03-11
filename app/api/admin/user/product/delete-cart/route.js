import User from "@/backend/models/user";
import dbConnect from "@/backend/config/dbConnect";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import errors from "@/backend/utils/errorHandler";

// api apply - api/admin/user/product/cart
export async function PUT(req) {
  try {
    const { names, token } = await req.json();
    const { _id } = jwt.verify(token, process.env.JWT_SECRET_CODE);
    dbConnect();
    const deleteCart = await User.updateOne(
      { _id },
      { $pull: { cartPro: { cPN: names } } }
    );
    if (deleteCart.acknowledged && deleteCart.modifiedCount > 0) {
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
          message: "Product removed from cart",
        }),
        {
          status: 200,
        }
      );
    } else {
      throw new Error("Product not removed from cart");
    }
  } catch (err) {
    return errors(err, 200);
  }
}
