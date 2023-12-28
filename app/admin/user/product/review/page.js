import React, { Fragment } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ClientComponent from "./clientComponent";
export const metadata = {
  title: "Product Review",
};
const CreateReviews = async ({ searchParams }) => {
  const { k, img, p } = searchParams;
  const cookieStore = cookies();
  const token = cookieStore.get(process.env.COOKIE_TOKEN_NAME)?.value;
  if (!token) {
    return redirect("/user/sign-up");
  }
  // const request = await fetch(
  //   `${process.env.PROTOCOL_AND_HOST}/api/product/single-product/${k}`,
  //   // { cache: "no-cache" }
  //   { next: { revalidate: 21600 } }
  // );
  // const result = await request.json();

  // const { success, product } = result;
  return (
    <Fragment>
      <ClientComponent token={token} _id={p} name={k} image={img} />
    </Fragment>
  );
};

export default CreateReviews;
