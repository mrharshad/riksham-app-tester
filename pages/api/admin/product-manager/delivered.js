import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user";
import jwt from "jsonwebtoken";

import ProcessedOrders from "@/backend/models/PUData";
import Products from "@/backend/models/Products";
//   api apply - admin/product-manage/order-receiver-cancel
export default async function handler(req, res) {
  try {
    dbConnect();
    const { newStatus, token, userId, orderId } = req.body;

    const _id = jwt.verify(token, process.env.JWT_SECRET_CODE)._id;

    const stateDistrict = {
      2: ["Chhattisgarh", "Raipur"],
    };
    const findManager = stateDistrict[_id];
    if (!findManager) {
      throw new Error(
        "Only Product Manager can change the status of the order"
      );
    }
    const [mState, mDistrict] = findManager;

    const findUser = await User.findOne({ _id: userId });
    if (!findUser) {
      throw new Error("user not found");
    }
    let { fName, lName, email, newOrder, reOSP, sugPC } = findUser;

    const dateFormatter = new Intl.DateTimeFormat("en-In", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const dateString = dateFormatter.format(new Date());
    let findOrder = false;
    const newOrderFilter = newOrder.filter((data) => {
      if (data._id !== orderId) {
        return data;
      } else {
        findOrder = data;
      }
    });
    if (!findOrder) {
      throw new Error("order not found");
    }
    const { state, district, qty, vD, iD, pId, pinCode, tOfP, createdAt } =
      findOrder;
    if (district !== mDistrict) {
      throw new Error("please check your state location");
    }
    findOrder.status = undefined;
    findUser.newOrder = newOrderFilter;
    const findProcessedOrders = await ProcessedOrders.findOne(
      {
        _id: userId,
      },
      { _id: 1 }
    );
    const findProduct = await Products.findOne({ _id: pId });
    if (!findProduct) {
      throw new Error("product not found");
    }

    const { category, aLife, variants, buyers, nOfB } = findProduct;
    let buyerIndex = buyers.findIndex((data) => data._id === userId);
    const bN = `${fName} ${lName}`;

    let newBuyerData = {
      _id: userId,
      bN: bN.length > 15 ? bN.substring(0, 14) + "..." : bN,
      bS: state,
      bD: district,
    };

    if (buyerIndex >= 0) {
      const filteredBuyer = buyers.filter(
        (data, index) => index !== buyerIndex
      );
      newBuyerData = buyers[buyerIndex];
      findProduct.buyers = filteredBuyer;
    } else {
      findProduct.nOfB = nOfB ? nOfB + 1 : 1;
    }
    newBuyerData.dDate = dateString;
    findProduct.buyers.unshift(newBuyerData);
    let variantIndex = 0;
    const findVariant = vD
      ? variants.find((variant, index) => {
          if (variant?.vD === vD) {
            variantIndex = index;
            return variant;
          }
        })
      : variants[0];
    let optionIndex = 0;
    if (!findVariant) {
      throw new Error("variant is not available");
    }
    const findOption = findVariant.options.find((setName, index) => {
      if (setName.optID === iD) {
        optionIndex = index;
        return setName;
      }
    });

    let stateIndex = 0;
    const findState = findOption.loc.find((sta, index) => {
      if (sta.s === state) {
        stateIndex = index;
        return sta;
      }
    });

    let districtIndex = 0;
    const findDistrict = findState.d.find((dis, index) => {
      if (dis.dN === district) {
        districtIndex = index;
        return dis;
      }
    });

    const disQty = findDistrict.qty - qty;
    variants[variantIndex].options[optionIndex].loc[stateIndex].d[
      districtIndex
    ].qty = disQty;
    findProduct.variants = variants;

    const currentDate = Date.now();
    reOSP = reOSP.filter((data) => {
      if (data?._id > currentDate && data?.opt !== tOfP) {
        return data;
      }
    });

    const insertIntTofP = reOSP.unshift({
      _id: new Date(currentDate + (aLife ? aLife : 30) * 24 * 60 * 60 * 1000),
      opt: tOfP,
    });
    if (insertIntTofP === 9) {
      insertIntTofP.pop();
    }

    sugPC = sugPC.filter((data) => data !== category);
    const insertIntTofPC = sugPC.unshift(category);

    if (insertIntTofPC === 6) {
      insertIntTofPC.pop();
    }

    findUser.reOSP = reOSP;
    findUser.sugPC = sugPC;

    findOrder.expectD = undefined;
    findOrder.statusUP = new Date();

    if (findProcessedOrders) {
      const updateProcessedOrder = await ProcessedOrders.updateOne(
        { _id: userId },
        {
          $push: {
            delivered: {
              $each: [findOrder],
              $position: 0,
            },
          },
        }
      );
      if (updateProcessedOrder.modifiedCount !== 1) {
        throw new Error("order status is not update");
      }
    } else {
      const createProcessedOrder = await ProcessedOrders.create({
        _id: userId,
        delivered: [findOrder],
      });
    }
    await findProduct.save();
    await findUser.save();

    return res.status(200).json({
      success: true,
      message: "Order status successfully updated",
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      message: err.message,
    });
  }
}
