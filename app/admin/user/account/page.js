import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Account from "./Account";

export const metadata = {
  title: "User Accounts",
};

const UserAccount = async () => {
  const value = cookies().get(process.env.COOKIE_TOKEN_NAME)?.value;
  if (!value) {
    redirect("/user/login");
  }

  return <Account />;
};

export default UserAccount;
