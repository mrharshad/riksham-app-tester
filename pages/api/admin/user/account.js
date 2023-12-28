import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import jwt from "jsonwebtoken";
import errors from "@/backend/utils/errorHandler";

export default async function handler(req, res, next) {
  const { query, method } = req;
  if (method !== "GET") {
    throw new Error("Please Change Method");
  }
  try {
    dbConnect();

    const { _id } = jwt.verify(query.token, process.env.JWT_SECRET_CODE);

    const findUser = await User.findOne({ _id }).select("+password");
    if (!findUser) {
      throw new Error("user not found");
    }
    res.status(200).json({
      success: true,
      data: findUser,
    });
  } catch (error) {
    return errors(req, 200, res);
  }
}
