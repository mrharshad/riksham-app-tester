import dbConnect from "@/backend/config/dbConnect";
import Products from "@/backend/models/Products";
// api apply = product?k  ,
export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      throw new Error("Please Change Method");
    }
    dbConnect();
    const { key, page } = req.query;
    const limit = process.env.TYPE_OF_PRODUCTS_PER_PAGE;
    const products = await Products.aggregate([
      {
        $match: {
          tOfP: key,
        },
      },

      {
        $sort: { sponsored: -1 },
      },
      { $skip: (page - 1) * limit },
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
