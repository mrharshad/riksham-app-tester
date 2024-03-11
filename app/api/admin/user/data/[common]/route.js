import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import { verify } from "jsonwebtoken";
import client from "@/backend/config/redisConnect";
import errors from "@/backend/utils/errorHandler";
export async function GET(req, context) {
  try {
    const { _id } = verify(context.params.common, process.env.JWT_SECRET_CODE);
    let data;
    // try {
    //   data = await client.hgetall(`user:${_id}`);
    // } catch (err) {}
    if (!data) {
      dbConnect();
      data = await User.findOne({ _id }, {}).select("+password");
      // try {
      //   await client.hset(`user:${_id}`, data);
      //   await client.expire(`user:${_id}`, 86400); //86400
      // } catch (err) {}
    } else {
      data = data._doc;
    }
    if (!data) {
      throw new Error("user not found");
    }
    delete data.__v;
    delete data.password;
    delete data.token;
    delete data.tokenExpire;
    delete data.verificationFailed;
    delete data.tokensSent;
    delete data.holdOnToken;
    delete data.holdOnVerification;
    delete data.password;

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return errors(req, 200);
  }
}
