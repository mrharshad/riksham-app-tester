import jwt from "jsonwebtoken";
import ProcessedOrders from "@/backend/models/PUData";
import dbConnect from "@/backend/config/dbConnect";
import errors from "@/backend/utils/errorHandler";

// apply pages -/admin/user/product/orders
export default async function handler(req, res) {
  try {
    const { query, method } = req;
    if (method !== "GET") {
      throw new Error("Please Change Method");
    }
    let { token, page, status, time, key } = query;
    time = time || 0;
    const _id = jwt.verify(token, process.env.JWT_SECRET_CODE)?._id;
    dbConnect();
    let pipeline = [
      {
        $match: {
          _id,
        },
      },
      {
        $unwind: `$${status}`,
      },

      {
        $sort: {
          [[status].sUpdate]: time > 1 ? 1 : -1, // Sorting createdAt field based on time
        },
      },
      {
        $group: {
          _id: "$_id",
          statusData: { $push: `$${status}` },
        },
      },
      {
        $project: {
          _id: false,
          sortedStatus: {
            $slice: ["$statusData", page > 1 ? (page - 1) * 3 : 0, 3],
          },
        },
      },
    ];

    if (time > 0 || key) {
      pipeline = pipeline.map((query, index) => {
        if (index === 2) {
          return time > 0
            ? {
                $match: {
                  [`${status}.sUpdate`]: {
                    $gte: new Date(
                      Date.now() - time * 30 * 24 * 61 * 60 * 1000
                    ),
                  },
                },
              }
            : {
                $match: {
                  [`${status}.name`]: {
                    $regex: key,
                    $options: "i",
                  },
                },
              };
        }
        return query;
      });
    }
    const findOrder = await ProcessedOrders.aggregate(pipeline);
    return res.status(200).json({
      success: true,
      orders: findOrder[0]?.["sortedStatus"] || [],
    });
  } catch (error) {
    return errors(error, 200, res);
  }
}
