import { cookies } from "next/headers";

export async function PUT(req) {
  try {
    cookies().delete(process.env.COOKIE_TOKEN_NAME);
    cookies().delete("userInfo");
    return new Response(
      JSON.stringify({ success: true, message: "Successfully Logged Out" }),
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
