import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import errors from "@/backend/utils/errorHandler";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
// apply - api/product?k
export async function PUT(req) {
  try {
    const body = await req.json();

    const { token, cPN, cPiD, cPvD } = body;
    dbConnect();
    const _id = jwt.verify(token, process.env.JWT_SECRET_CODE)._id;

    const findUser = await User.findOne({ _id });
    if (!findUser) {
      throw new Error("user not found");
    }
    function success(message) {
      return new Response(
        JSON.stringify({
          success: true,
          message,
        }),
        {
          status: 200,
        }
      );
    }

    const { cartPro } = findUser;
    const findProduct = cartPro.some((product) => product.cPN === cPN);
    if (findProduct) {
      return success("Product already available in cart");
    }
    if (cartPro.length === 5) {
      throw new Error("Maximum 5 products can be placed in the cart");
    }
    const dateFormatter = new Intl.DateTimeFormat("en-In", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const update = await findUser.updateOne({
      $push: {
        cartPro: {
          cPN,
          cPiD,
          cPvD,
          cPAddAt: dateFormatter.format(new Date()),
        },
      },
    });
    if (update.acknowledged && update.modifiedCount === 1) {
      cookies().set({
        name: "userInfoRevalidate",
        value: Math.floor(Math.random() * 999999).toString(),
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ), //
        httpOnly: true,
        path: "/",
      });
      return success("Product has been added to cart");
    }
  } catch (error) {
    return errors(error, 200);
  }
}
