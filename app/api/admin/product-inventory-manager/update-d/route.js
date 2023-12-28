import dbConnect from "@/backend/config/dbConnect";
import Products from "@/backend/models/Products";
import jwt from "jsonwebtoken";
import errors from "@/backend/utils/errorHandler";
// apply pages - inventory manager - product update karne ke liye
export async function PUT(req) {
  try {
    dbConnect();
    const {
      _id,
      name,
      category,
      brand,
      tOfP,
      keyValueD,
      description,
      aInfo,
      token,
    } = await req.json();
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_CODE);
    const { role, _id: agentId } = decodedToken;

    if (!role.includes("Product Inventory Manager")) {
      throw new Error("This resource is not for you");
    }

    const updateProduct = await Products.updateOne(
      { _id },
      {
        $set: {
          name,
          category,
          brand,
          tOfP,
          keyValueD,
          description,
          aInfo,
        },
      }
    );
    if (updateProduct.modifiedCount > 0 && updateProduct.matchedCount === 1) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Product Has Been Updated Successfully",
        }),
        {
          status: 200,
        }
      );
    } else {
      throw new Error("Product Update Failed");
    }
  } catch (error) {
    return errors(error, 200);
  }
}
