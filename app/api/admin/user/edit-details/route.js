import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import errors from "@/backend/utils/errorHandler";
import { cookies } from "next/headers";
export async function PUT(req) {
  try {
    let {
      fName,
      lName,
      password,
      mobileNo,
      address,
      pinCode,
      state,
      district,
      token,
      birth,
      gender,
      hashedPassword,
      email,
    } = await req.json();

    const age = new Date().getFullYear() - new Date(birth).getFullYear();

    if (
      typeof mobileNo === "number"
        ? JSON.stringify(mobileNo).length != 10
        : mobileNo.length != 10 || typeof pinCode === "number"
        ? JSON.stringify(pinCode).length != 6
        : pinCode.length != 6 || age < 4 || age > 80 || !age
    ) {
      throw new Error("information  is incorrect");
    }

    const { _id } = jwt.verify(token, process.env.JWT_SECRET_CODE);
    function capitalizeWords(str) {
      return str.replace(/\b\w/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }

    const verifyPassword = await bcrypt.compare(password, hashedPassword);
    if (!verifyPassword) {
      throw new Error("password is incorrect");
    }
    fName = capitalizeWords(fName.toLowerCase().trim());
    lName = capitalizeWords(lName.toLowerCase().trim());
    address = capitalizeWords(address.toLowerCase().trim());
    district = capitalizeWords(district.toLowerCase().trim());
    state = capitalizeWords(state.toLowerCase().trim());
    gender = capitalizeWords(gender.toLowerCase().trim());

    dbConnect();
    const [bYear, bMonth, bDate] = birth.split("-");
    const update = await User.updateOne(
      { _id },
      {
        $set: {
          fName,
          lName,
          mobileNo,
          address,
          state,
          district,
          pinCode,
          bDate,
          bMonth,
          bYear,
          gender,
        },
      },
      {
        runValidators: true,
      }
    );
    if (update.modifiedCount === 1) {
      cookies().set({
        name: "userInfo",
        value: JSON.stringify({
          fName,
          lName,
          pinCode,
          state,
          district,
          email,
          gender,
          bYear,
        }),
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        path: "/",
      });

      cookies().set({
        name: "userInfoRevalidate",
        value: Math.floor(Math.random() * 999999).toString(),
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
        ), //
        httpOnly: true,
        path: "/",
      });
      return new Response(
        JSON.stringify({
          success: true,
          message: "User Profile has been successfully Updated",
        }),
        {
          status: 200,
        }
      );
    } else {
      throw new Error("profile han been not updated");
    }
  } catch (error) {
    return errors(error, 200);
  }
}
