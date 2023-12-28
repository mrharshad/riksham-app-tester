import dbConnect from "@/backend/config/dbConnect";
import Products from "@/backend/models/Products";
export async function POST(req) {
  try {
    // apply pages - product-inventory-manager /update-product-and-delete-variant
    const { keyword, page } = await req.json();
    const limit = process.env.PRODUCT_PER_PAGE;
    dbConnect();
    const products = await Products.find(
      { name: { $regex: keyword, $options: "i" } },
      {
        reviews: false,
        rating: false,
        numOfReviews: false,
        ratingInPercent: false,
      }
    )
      .skip((page - 1) * limit)
      .limit(limit);
    return new Response(
      JSON.stringify({
        success: true,
        products,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 200,
      }
    );
  }
}
