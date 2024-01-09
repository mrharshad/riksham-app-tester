import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import { verify } from "jsonwebtoken";
import errors from "@/backend/utils/errorHandler";

export async function GET(req, { params }) {
  const { method } = req;
  if (method !== "GET") {
    throw new Error("Please Change Method");
  }
  try {
    dbConnect();
    const { _id } = verify(params.account, process.env.JWT_SECRET_CODE);
    const findUser = await User.findOne({ _id });

    if (!findUser) {
      throw new Error("user not found");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: findUser,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return errors(req, 200);
  }
}
