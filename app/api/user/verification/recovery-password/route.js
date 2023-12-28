import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Jwt from "jsonwebtoken";

// apply api - /user/password-recovery
export async function PUT(req) {
  try {
    const { password, key } = await req.json();
    dbConnect();
    const token = crypto.createHash("sha256").update(key).digest("hex");
    const findToken = await User.findOne({
      token,
      tokenExpire: { $gt: Date.now() },
    });
    if (!findToken) {
      throw new Error("key expired");
    }
    let { _id, fName, lName, email, role, pinCode, state, district } =
      findToken;
    findToken.password = await bcrypt.hash(password, 10);
    findToken.token = undefined;
    findToken.tokenExpire = undefined;
    findToken.verificationFailed = undefined;
    findToken.tokensSent = undefined;
    findToken.holdOnToken = undefined;
    findToken.holdOnVerification = undefined;
    await findToken.save();

    const jwtToken = Jwt.sign(
      {
        _id,
        role,
      },
      process.env.JWT_SECRET_CODE,
      {
        expiresIn: process.env.JWT_EXPIRE_TIME,
      }
    );
    cookies().set({
      name: "userInfo",
      value: JSON.stringify({
        fName,
        lName,
        pinCode,
        state,
        district,
        email,
      }),
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      path: "/", // all path
    });

    cookies().set({
      name: process.env.COOKIE_TOKEN_NAME,
      value: jwtToken,
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      path: "/", // all path
    });
    return new Response(
      JSON.stringify({
        success: true,
        message: `User password has been changed successfully`,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        status: 200,
      }
    );
  }
}
