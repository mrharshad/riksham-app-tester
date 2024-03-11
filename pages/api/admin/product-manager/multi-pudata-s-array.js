import dbConnect from "@/backend/config/dbConnect";
import ProcessedUserData from "@/backend/models/PUData";
import jwt from "jsonwebtoken";
//   api apply - admin/product-manager/orders-received-cancel

export default async function handler(req, res) {
  try {
    const { page, status, token } = req.query;
    const _id = jwt.verify(token, process.env.JWT_SECRET_CODE)._id;

    const stateDistrict = {
      2: ["Chhattisgarh", "Raipur"],
    };
    const findManager = stateDistrict[_id];
    const [state, district] = findManager;
    if (!findManager) {
      throw new Error(
        "Only Product Manager can change the status of the order"
      );
    }
    dbConnect();
    const pipeline = [
      { $unwind: `$${status}` },
      { $skip: 12 * (page - 1) },
      { $limit: 12 },
      {
        $project: {
          [status]: true,
        },
      },
      {
        $match: {
          $and: [
            {
              [`${status}.state`]: state,
            },
            {
              [`${status}.district`]: district,
            },
            {
              [`${status}.statusUP`]: {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
      },
    ];

    const orders = await ProcessedUserData.aggregate(pipeline);
    res.status(200).json({ success: true, orders });
  } catch (err) {
    return res.status(200).json({
      success: true,
      message: err.message,
    });
  }
}
