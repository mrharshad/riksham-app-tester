import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  try {
    dbConnect();
    const { page, status, token } = req.query;

    const _id = jwt.verify(token, process.env.JWT_SECRET_CODE)._id;
    const stateDistrict = {
      2: ["Chhattisgarh", "Raipur"],
    };
    const singleArray = ["out for delivery", "dispatch", "confirm", "pending"];
    let statusName = singleArray.includes(status) ? "newOrder" : null;

    const [state, district] = stateDistrict[_id];
    const pipeline = [
      { $unwind: `$${statusName || status}` },
      { $skip: 12 * (page - 1) },
      { $limit: 12 },
      {
        $project: {
          [statusName || status]: true,
        },
      },
    ];

    if (statusName) {
      pipeline.push({
        $match: {
          $and: [
            {
              "newOrder.state": state,
            },
            {
              "newOrder.district": district,
            },
            {
              [`newOrder.status`]: status,
            },
          ],
        },
      });
    } else {
      pipeline.push({
        $match: {
          $and: [
            {
              [`${status}.state`]: state,
            },
            {
              [`${status}.district`]: district,
            },
          ],
        },
      });
    }

    const orders = await User.aggregate(pipeline);
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(200).json({ success: false, message: err.message });
  }
}
