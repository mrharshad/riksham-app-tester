import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import { cookies } from "next/headers";
// apply api - /user/login
export async function POST(req) {
  try {
    const { email, password } = await req.json();

    dbConnect();
    const findUser = await User.findOne({ email }).select("+password");
    if (!findUser) {
      throw new Error("Please Enter Your ID and Password Correctly");
    }
    let {
      _id,
      password: userPassword,
      role,
      fName,
      pinCode,
      email: userEmail,
      lName,
      state,
      district,
      holdOnVerification,
      verificationFailed,
      bYear,
      gender,
    } = findUser;
    if (!userPassword) {
      throw new Error("not verified your email");
    }
    verificationFailed = verificationFailed || 0;
    if (holdOnVerification > Date.now()) {
      const pendingTime = ((holdOnVerification - Date.now()) / 60 / 60 / 1000)
        .toFixed(2)
        .toString();
      const [hours, minute] = pendingTime.split(".");
      throw new Error(
        `try after: ${
          pendingTime.length > 2
            ? `${hours}:hours ${minute}:minutes`
            : `${minute}: minutes`
        }`
      );
    }

    const verifyPassword = await bcrypt.compare(password, userPassword);
    if (verifyPassword) {
      findUser.token = undefined;
      findUser.tokenExpire = undefined;
      findUser.verificationFailed = undefined;
      findUser.tokensSent = undefined;
      findUser.holdOnToken = undefined;
      findUser.holdOnVerification = undefined;
      await findUser.save();
      const createJwtToken = Jwt.sign(
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
        name: process.env.COOKIE_TOKEN_NAME,
        value: createJwtToken,
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ), // 2023-06-28T08:19:14.768Z  iss prakar ka data lita hai
        httpOnly: true,
        path: "/", // all path
      });

      cookies().set({
        name: "userInfo",
        value: JSON.stringify({
          fName,
          lName,
          pinCode,
          state,
          district,
          email: userEmail,
          bYear,
          gender,
        }),
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        path: "/", // all path
      });
      return new Response(
        JSON.stringify({
          success: true,
          message: "User Has Been Successfully Login",
        }),
        {
          status: 200,
        }
      );
    } else {
      const updatePassword = await findUser.updateOne({
        $set: {
          holdOnVerification:
            verificationFailed >= 4
              ? Date.now() + 12 * 60 * 60 * 1000
              : undefined,
          verificationFailed:
            verificationFailed >= 4 ? 0 : verificationFailed + 1,
        },
      });
      if (updatePassword.modifiedCount === 1) {
        throw new Error("Please Enter Your ID and Password Correctly");
      }
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 200,
      }
    );
  }
}
