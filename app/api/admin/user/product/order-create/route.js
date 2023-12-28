import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import AdditionalInfo from "@/backend/models/AdditionalInfo";
import errors from "@/backend/utils/errorHandler";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
// api apply - /admin/user/product/buy
export async function PUT(req) {
  try {
    const docId = { _id: "additionalInfo" };
    const {
      token,
      pId,
      qty,
      shipping,
      packaging,
      state,
      district,
      name: productName,
      mrp,
      current,
      address,
      image,
      pinCode,
      imageSetD,
      mNumber,
      tOfP,
      tofPay,
      expectD,
      iD: newID,
      vD: newVD,
    } = await req.json();

    if (tofPay === "Cash on Delivery / Pay on Delivery" && qty > 2) {
      throw new Error(
        "In cash delivery method you cannot order more than 2 quantities."
      );
    }
    const _id = jwt.verify(token, process.env.JWT_SECRET_CODE)?._id;
    dbConnect();

    const findUser = await User.findOne({ _id });
    const { newOrder } = findUser;
    const findOrder = newOrder.some((orders) => {
      const { vD, iD, name } = orders;
      if (name === productName && vD === newVD && iD === newID) {
        return true;
      }
    });
    if (findOrder) {
      throw new Error(
        "This product cannot be ordered until the product is delivered"
      );
    }
    let nonDelivered = newOrder.filter(
      (order) => order.tofPay === "Cash on Delivery / Pay on Delivery"
    );
    if (nonDelivered.length > 1) {
      throw new Error("Wait for some time until a product is delivered to you");
    }

    const findLastId = await AdditionalInfo.findByIdAndUpdate(
      docId,
      {
        $inc: { lastOrderId: 1 },
      },
      {
        projection: {
          lastOrderId: 1,
        },
      }
    );
    if (!findLastId) {
      throw new Error("last id not fetching");
    }
    try {
      findLastId.lastOrderId += 1;

      const productNewOrder = await findUser.updateOne({
        $push: {
          newOrder: {
            _id: findLastId.lastOrderId,
            pId,
            address,
            district,
            state,
            pinCode,
            mNumber,
            expectD,
            name: productName,
            qty,
            image,
            current,
            mrp: mrp > 0 ? mrp : undefined,
            tofPay,
            iD: newID,
            tOfP,
            status: "pending",
            shipping: shipping || undefined,
            imageSetD: imageSetD || undefined,
            packaging: packaging || undefined,
            vD: newVD || undefined,
            createdAt: Date.now(),
          },
        },
      });
      if (productNewOrder.acknowledged && productNewOrder.modifiedCount === 1) {
        cookies().set({
          name: "userInfoRevalidate",
          value: Math.floor(Math.random() * 999999).toString(),
          expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
          ),
          httpOnly: true,
          path: "/",
        });
        return new Response(
          JSON.stringify({
            success: true,
            message: "Order placed, thank you!",
          }),
          {
            status: 200,
          }
        );
      }
    } catch (error) {
      await AdditionalInfo.updateOne(docId, {
        $inc: { lastOrderId: -1 },
      });
      throw new Error(error.message);
    }
  } catch (error) {
    return errors(error, 200);
  }
}
