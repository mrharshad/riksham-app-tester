import client from "@/backend/config/redisConnect";
import dbConnect from "@/backend/config/dbConnect";
import Products from "@/backend/models/Products";
// apply api ka use -    /single-p

export async function GET(req) {
  try {
    let { searchParams } = new URL(req.url);
    let fetchKey = searchParams.get("fetchKey");
    let page = searchParams.get("page");
    let name = searchParams.get("name");
    console.log("api called", fetchKey, name, page);
    const limit = process.env.PRODUCT_PER_PAGE;
    let skipIndex = (page - 1) * limit;
    skipIndex = skipIndex <= 0 ? 0 : skipIndex;
    let data = false;
    const url = `${fetchKey}:${name}`;
    try {
      // data = await client.lrange(
      //   url,
      //   skipIndex,
      //   skipIndex + limit - 1
      // );
    } catch (err) {}
    if (!data) {
      dbConnect();
      data = await Products.find({ [fetchKey]: name })
        .sort({ popular: -1 })
        .skip(skipIndex)
        .limit(limit);
      // try {
      //   if (page == 1) {
      //     await client.rpush(
      //       url,
      //       ...data
      //     );
      //     await client.expire(url, 86400); //86400
      //   } else {
      //     await client.rpushx(
      //       url,
      //       ...data
      //     );
      //   }
      // } catch (err) {}
    } else {
      data = data._doc;
    }
    const numOfPro = data?.length;
    const timeWast = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, 3000);
    });
    if (timeWast) {
      console.log("timeWast", timeWast);
      return new Response(
        JSON.stringify({
          success: true,
          data,
          resPage: limit > numOfPro ? null : page + 1,
          numOfPro,
        }),
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      {
        status: 200,
      }
    );
  }
}
