import dbConnect from "@/backend/config/dbConnect";
import Products from "@/backend/models/Products";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import errors from "@/backend/utils/errorHandler";
import AdditionalInfo from "@/backend/models/AdditionalInfo";

// apply pages - inventory manager - product update karne ke liye
export async function PUT(req) {
  const docId = { _id: "additionalInfo" };
  try {
    dbConnect();
    const {
      _id,
      token,
      imageSets,
      variants,
      imageSetD,
      variantD,
      deletingSelectedImg,
      newImagesCount,
      name,
    } = await req.json();

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_CODE);
    const { role, _id: agentId } = decodedToken;
    if (!role.includes("Product Inventory Manager")) {
      throw new Error("This resource is not for you");
    }

    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
      api_key: process.env.CLOUDINARY_CLIENT_API,
      api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
    });

    const imagesLinks = [];
    const public_ids = [];

    // jab hum kisi to third party technology ka use karte hai jisme data ka result ka time unaspected hota hai to hum kisi bhi prakar se function loop ka istemal nhi kar sakte hai kyoki yaha par agar cloudnary ke response se pahale mongodb me data sote ho sakta hai
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

    if (newImagesCount > 0) {
      try {
        for (let data of imageSets) {
          const { iD, images } = data;
          const singleSet = [];
          for (let img of images) {
            if (img?.public_id) {
              singleSet.push(img);
            } else {
              const result = await cloudinary.v2.uploader.upload(img, {
                folder: "Product",
              });
              const { public_id, secure_url } = result;
              public_ids.push(public_id);
              singleSet.push({
                public_id: public_id,
                url: secure_url,
              });
            }
          }
          imagesLinks.push({ iD, images: singleSet });
        }
      } catch (err) {
        const deleteImg = await cloudinary.v2.api.delete_resources(public_ids);
        await checkDeletedImg(deleteImg);
        throw new Error(err.message);
      }
    }
    const imagesLinksLength = imagesLinks.length;

    const success = new Response(
      JSON.stringify({
        success: true,
        message: "Product Has Been Updated Successfully",
      }),
      {
        status: 200,
      }
    );
    const updateProduct = await Products.updateOne(
      { _id },
      {
        $set: {
          variants,
          imageSets: imagesLinksLength > 0 ? imagesLinks : imageSets,
          imageSetD,
          variantD,
        },
      }
    );
    async function imageDeleteFunc() {
      const deletingSelectedImgLength = deletingSelectedImg.length;

      if (deletingSelectedImgLength > 0) {
        const deleteImg = await cloudinary.v2.api.delete_resources(
          deletingSelectedImg
        );
        await checkDeletedImg(deleteImg);
      }
    }
    if (updateProduct.modifiedCount === 0 && updateProduct.matchedCount === 1) {
      await imageDeleteFunc();
      return success;
    } else if (updateProduct.modifiedCount > 0) {
      await imageDeleteFunc();
      return success;
    } else {
      const deleteImg = await cloudinary.v2.api.delete_resources(public_ids);
      await checkDeletedImg(deleteImg);
      throw new Error("Product Update Failed");
    }
  } catch (error) {
    return errors(error, 200);
  }
}
