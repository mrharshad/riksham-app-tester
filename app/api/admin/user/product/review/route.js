import jwt from "jsonwebtoken";
import dbConnect from "@/backend/config/dbConnect";
import errors from "@/backend/utils/errorHandler";
import Products from "@/backend/models/Products";

// apply pages -/admin/user/product/review
export async function POST(req) {
  try {
    const body = await req.json();
    let { token, _id, comment, newRating } = body;
    comment = comment.trim();
    if (comment.length > 300) {
      throw new Error("Must not exceed 300 characters");
    }
    const userId = jwt.verify(token, process.env.JWT_SECRET_CODE)?._id;
    dbConnect();
    const findProduct = await Products.findOne({ _id });
    if (!findProduct) {
      throw new Error("Product Not found");
    }
    let { buyers, nOfB } = findProduct;

    nOfB = Number(nOfB) || 0;
    let isBuyerIndex = false;
    let isCreatedRating = false;
    let confirmRating = newRating;
    const stars = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    buyers.forEach((data, index) => {
      const bR = data?.bR;
      if (data._id == userId) {
        isBuyerIndex = index;
        isCreatedRating = bR;
      }
      if (bR) {
        confirmRating = confirmRating + bR;
        stars[bR] = stars[bR] + 1;
      }
    });

    if (isBuyerIndex === false) {
      throw new Error(
        "Only those who have purchased the product and the product has been delivered can rate and review."
      );
    }
    if (isCreatedRating >= 0) {
      confirmRating = confirmRating - isCreatedRating;
      stars[isCreatedRating] = stars[isCreatedRating] - 1;
    }

    stars[newRating] = stars[newRating] + 1;
    const totalReviews = Object.values(stars).reduce((a, b) => a + b, 0);
    const percentageRatings = [];
    for (const [bR, count] of Object.entries(stars)) {
      const percentage = (count / totalReviews) * 100;
      percentageRatings.push(Number(percentage.toFixed()));
    }
    findProduct.rInP = percentageRatings;
    findProduct.rating = (confirmRating / totalReviews).toFixed(1);
    findProduct.buyers[isBuyerIndex].bC = comment;
    findProduct.buyers[isBuyerIndex].bR = newRating;
    await findProduct.save();
    return new Response(
      JSON.stringify({
        success: true,
        message: isCreatedRating
          ? "Your review has been updated"
          : "This review of yours will help the customer to choose the product",
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return errors(error, 200);
  }
}
