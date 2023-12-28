import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Client } from "./client";

const page = async ({ searchParams }) => {
  const { k, n, i } = searchParams;
  const cookieStore = cookies();

  const token = cookieStore.get(process.env.COOKIE_TOKEN_NAME)?.value;
  if (!token) {
    redirect("/user/sign-up");
  }

  return <Client image={i} name={n} orderId={k} token={token} />;
};

export default page;
