import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";

import errors from "@/backend/utils/errorHandler";

export default async function handler(req, res, next) {
  const { query, method } = req;
  if (method !== "GET") {
    throw new Error("Please Change Method");
  }
  try {
    dbConnect();

    const findUser = await User.findOne({ _id: query.token }).select(
      "+password"
    );

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
