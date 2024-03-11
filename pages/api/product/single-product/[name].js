import dbConnect from "@/backend/config/dbConnect";
import Products from "@/backend/models/Products";
// api apply = product?k  ,  product/buy?  , /admin/user/product/cart
export default async function handler(req, res, next) {
  try {
    if (req.method !== "GET") {
      throw new Error("Please Change Method");
    }
    dbConnect();
    const { name } = req.query;

    const product = await Products.findOne(
      {
        name,
      },
      { "variants.options.purchased": 0 }
    );

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
}
