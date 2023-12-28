import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import jwt from "jsonwebtoken";
//   api apply - admin/product-manage/order-receiver-cancel

export default async function handler(req, res) {
  try {
    dbConnect();
    const { newStatus, userId, token, orderId } = req.body;
    const _id = jwt.verify(token, process.env.JWT_SECRET_CODE)._id;

    const stateDistrict = {
      2: ["Chhattisgarh", "Raipur"],
    };
    const findManager = stateDistrict[_id];
    if (!findManager) {
      throw new Error(
        "Only Product Manager can change the status of the order"
      );
    }
    const [state, district] = findManager;

    const updateStatus = await User.updateOne(
      {
        _id: userId,
        "newOrder._id": orderId,
      },
      {
        $set: {
          "newOrder.$.status": newStatus,
          "newOrder.$.statusUP": Date.now(),
        },
      }
    );
    if (updateStatus.modifiedCount === 1) {
      return res.status(200).json({
        success: true,
        message: "Order status successfully updated",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "please refresh your page",
      });
    }
  } catch (err) {
    return res.status(200).json({
      success: true,
      message: err.message,
    });
  }
}
