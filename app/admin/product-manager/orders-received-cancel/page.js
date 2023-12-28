import React from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import ClientComponent from "./clientComponent";
export const metadata = {
  title: "Product Order Received / Cancel",
};

const OrderReceivedCancel = async ({ searchParams }) => {
  let { status, page } = searchParams;
  const cookieStore = cookies();
  const token = cookieStore.get(process.env.COOKIE_TOKEN_NAME)?.value;
  if (!token) {
    return notFound();
  }
  page = page || 1;
  status = status || "pending";
  const productOrders = await fetch(
    `${process.env.PROTOCOL_AND_HOST}/api/admin/product-manager/${
      status == "delivered" || status == "returned"
        ? "multi-pudata-s-array"
        : "district-orders"
    }?status=${status}&page=${page}&token=${token}`,
    { cache: "no-cache" }
  );
  const result = await productOrders.json();
  if (!result.success) {
    return notFound();
  }

  return (
    <ClientComponent
      ordersData={result.orders}
      status={status}
      token={token}
      page={page}
    />
  );
};

export default OrderReceivedCancel;
