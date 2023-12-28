// import dbConnect from "@/backend/config/dbConnect";
import dbConnect from "../../../backend/config/dbConnect";
// import Products from "@/backend/models/Products";
import Products from "../../../backend/models/Products";
// apply api  - home page me product find
export default async function handler(req, res) {
  const { query, method } = req;
  if (method !== "GET") {
    throw new Error("Please Change Method");
  }
  try {
    dbConnect();
    const { keyword, max, min, page } = query;
    const pages = page || 1;
    const limit = process.env.PRODUCT_PER_PAGE;
    const skipIndex = (pages - 1) * limit;
    const products = await Products.aggregate([
      {
        $match: {
          $or: [
            {
              name: {
                $regex: keyword ? keyword : "",
                $options: "i",
              },
            },
            {
              sponsored: { $lte: keyword ? 0 : 50000 },
            },
          ],
        },
      },

      // {
      //   $match: {
      //     "variants.$.colors.$.currentPrice": {
      //       $gte: min ? min : 1,
      //       $lte: max ? max : 9999999,
      //     },
      //   },
      // },
      // {
      //   $sort: {
      //     [keyword ? "currentPrice" : "sponsored"]: keyword ? 1 : -1,
      //   },
      // },

      { $skip: skipIndex },
      { $limit: limit },
      {
        $project: {
          createdAt: 0,
          rInP: 0,
          reviews: 0,
          category: 0,
          brand: 0,
          aInfo: 0,
          keyValueD: 0,
          description: 0,
          "variants.options.loc": 0,
          "variants.options.purchased": 0,
        },
      },
    ]);
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
}
