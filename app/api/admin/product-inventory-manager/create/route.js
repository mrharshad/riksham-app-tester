import dbConnect from "@/backend/config/dbConnect";
import Products from "@/backend/models/Products";
import errors from "@/backend/utils/errorHandler";
import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";
import AdditionalInfo from "@/backend/models/AdditionalInfo";
// apply pages - product inventory manager - create

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: "10mb", // Set desired value here
//     },
//   },
// };
export async function POST(req) {
  const docId = { _id: "additionalInfo" };
  try {
    dbConnect();
    let {
      name,
      category,
      description,
      brand,
      keyValueD,
      tOfP,
      token,
      imageSetD,
      imageSets,
      variantD,
      variants,
      aInfo,
    } = await req.json();

    const { _id, role } = jwt.verify(token, process.env.JWT_SECRET_CODE);
    if (!role.includes("Product Inventory Manager")) {
      throw new Error("This resource is not for you");
    }

    const imagesLinks = [];
    const public_ids = [];

    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
      api_key: process.env.CLOUDINARY_CLIENT_API,
      api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
    });
    async function checkDeletedImg(deleteImgs) {
      const notDeletedImg = [];
      const deletedObj = deleteImgs.deleted;
      for (let i in deletedObj) {
        if (deletedObj[i] !== "deleted") {
          notDeletedImg.push(i);
        }
      }
      if (notDeletedImg.length > 0) {
        const dateFormatter = new Intl.DateTimeFormat("en-In", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const updateAdditionalInfo = await AdditionalInfo.updateOne(docId, {
          $push: {
            nonDeletedImg: {
              _id: dateFormatter.format(new Date()),
              publicId: notDeletedImg,
              nonDIPName: name,
            },
          },
        });
        if (updateAdditionalInfo.modifiedCount !== 1) {
          throw new Error(
            "images that could not be deleted could not be stored in the database either."
          );
        }
      }
    }
    try {
      for (let data of imageSets) {
        const { iD, images } = data;
        let singleSetImg = [];
        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "Product",
          });
          const { public_id, secure_url } = result;
          public_ids.push(public_id);
          singleSetImg.push({
            public_id: public_id,
            url: secure_url,
          });
        }
        imagesLinks.push({ iD, images: singleSetImg });
      }
    } catch (err) {
      const deleteImg = await cloudinary.v2.api.delete_resources(public_ids);
      await checkDeletedImg(deleteImg);
      throw new Error(err.message);
    }
    const dateFormatter = new Intl.DateTimeFormat("en-In", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const findLastId = await AdditionalInfo.findByIdAndUpdate(
      docId,
      {
        $inc: { lastProductId: 1 },
      },
      {
        projection: {
          lastProductId: 1,
        },
      }
    );

    if (!findLastId) {
      throw new Error("last id not fetching");
    }
    try {
      findLastId.lastProductId += 1;
      const newProduct = await Products.create({
        _id: findLastId.lastProductId,
        name,
        description,
        brand: brand || undefined,
        variantD: variantD || undefined,
        category,
        tOfP,
        imageSets: imagesLinks,
        variants,
        keyValueD,
        aInfo,
        imageSetD: imageSetD || undefined,
        createdAt: dateFormatter.format(new Date()),
      });
    } catch (err) {
      const decrees = await AdditionalInfo.updateOne(docId, {
        $inc: { lastProductId: -1 },
      });
      const deleteImg = await cloudinary.v2.api.delete_resources(public_ids);
      await checkDeletedImg(deleteImg);
      if (decrees.modifiedCount !== 1)
        err.message = "id of product not reduced from database";
      throw new Error(err.message);
    }
    return new Response(
      JSON.stringify({
        success: true,
        message: "Product Created Successfully",
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return errors(error, 200);
  }
}
