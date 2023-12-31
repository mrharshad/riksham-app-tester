import Header from "./Layouts/Header";
import "./globals.css";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import Footer from "./Layouts/Footer";
import { Providers } from "./redux/providers";
import { verify } from "jsonwebtoken";
import client from "@/backend/config/redisConnect";

export const metadata = {
  title: "riksham",
  description: "Generated by create next app",
};

export default async function RootLayout({ children }) {
  const cookieStore = cookies();
  const value = cookieStore.get(process.env.COOKIE_TOKEN_NAME)?.value;
  const tokenVerify = () => {
    try {
      return verify(value, process.env.JWT_SECRET_CODE);
    } catch (err) {
      return null;
    }
  };
  let userData;

  if (value) {
    const { _id } = tokenVerify();
    userData = await client.hgetall(`user:${_id}`);
    if (!userData) {
      userData = await fetch(
        `${process.env.PROTOCOL_AND_HOST}/api/admin/user/${value}
        `,
        { cache: "no-cache" }
        // { next: { revalidate: 21600 } }
      );

      const { success, message, data } = await userData.json();
      // delete data.__v;
      await client.hset(`user:${_id}`, data);

      userData = data;
    }
    await client.expire(`user:${_id}`, 86400);
  }
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header Link={Link} Image={Image} userData={userData} />
          {children}
          <Footer Link={Link} Image={Image} />
        </Providers>
      </body>
    </html>
  );
}
