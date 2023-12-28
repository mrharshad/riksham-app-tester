import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import jwt from "jsonwebtoken";
//   api apply - admin/product-manage/order-receiver-cancel
export default async function handler(req, res) {
  try {
    dbConnect();
    const { newStatus, token, cancelR, details } = req.body;
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
    const [mState, mDistrict] = findManager;
    const { _id: orderId, userId, district } = details;
    if (district !== mDistrict) {
      throw new Error("please check your state location");
    }
    const pullData = await User.updateOne(
      { _id: userId },
      { $pull: { newOrder: { _id: orderId } } }
    );
    if (pullData.matchedCount === 1) {
      details.status = undefined;
      details.cancelR = cancelR;
      details.statusUP = Date.now();
      await User.updateOne(
        { _id: userId },
        { $push: { [newStatus]: details } }
      );
    } else {
      throw new Error("order not updated");
    }
    return res.status(200).json({
      success: true,
      message: "Order status successfully updated",
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      message: err.message,
    });
  }
}
