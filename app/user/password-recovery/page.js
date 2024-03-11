import Link from "next/link";
import React, { Fragment } from "react";
import Recovery from "./recovery";
import { redirect } from "next/navigation";

const page = async ({ searchParams }) => {
  const token = searchParams.key;

  if (!token) {
    redirect("/");
  }
  return (
    <Fragment>
      <Recovery token={token} Link={Link} />
    </Fragment>
  );
};

export default page;
