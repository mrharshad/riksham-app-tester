import React, { Fragment } from "react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import style from "./orders.module.css";
import SearchOrders from "./searchOrders";

export const metadata = {
  title: "Product Orders",
};
const page = async ({ searchParams }) => {
  let { status, page, time, key } = searchParams;
  key = key || " ";
  page = page || 1;
  status = status || "newOrder";

  const cookieStore = cookies();
  const token = cookieStore.get(process.env.COOKIE_TOKEN_NAME)?.value;
  const validation = cookieStore.get("userInfoRevalidate")?.value;
  if (!token) {
    return redirect("/user/sign-up");
  }
  const typeOfStatus = status !== "canceled" && status !== "newOrder";
  let result = await fetch(
    `${process.env.PROTOCOL_AND_HOST}/api/admin/` +
      (typeOfStatus
        ? `user/product/processed-orders?token=${token}&status=${status}&page=${page}&time=${time}&key=${key}`
        : `user/account?token=${token}&validation=${validation || "newData"}`),
    { cache: "no-cache" }
    // { next: { revalidate: 21600 } }
  );

  const data = await result.json();
  let { success, orders, newOrder, canceled, message } = typeOfStatus
    ? data
    : data.data;
  if (!typeOfStatus) {
    orders = (status === "newOrder" ? newOrder : canceled).slice(
      page > 1 ? page * 3 : 0,
      3
    );
  }
  if (message) {
    return redirect("/user/login");
  }
  const times = [3, 6, 12, 24, 36];
  const ordersLength = orders.length;
  const dateFormatter = new Intl.DateTimeFormat("en-In", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Fragment>
      <section id="productUser" className={style.section}>
        <div className={style.options}>
          <p>Your Orders</p>
          <label className={style.status} htmlFor="">
            <Link
              style={{
                borderBottom:
                  status === "newOrder" ? "1px solid #00ceff" : null,
              }}
              href="?status=newOrder"
            >
              Pending
            </Link>
            <Link
              style={{
                borderBottom:
                  status === "canceled" ? "1px solid #00ceff" : null,
              }}
              href="?status=canceled"
            >
              Canceled
            </Link>
            <Link
              style={{
                borderBottom: typeOfStatus ? "1px solid #00ceff" : null,
              }}
              href={`?status=delivered`}
            >
              Delivered
            </Link>
          </label>
          <input
            className={style.timeToggles}
            type="checkbox"
            name="status"
            id="status"
          />
          {typeOfStatus ? (
            <label className={style.time} htmlFor="status">
              <p>
                {time
                  ? `${time >= 12 ? time / 12 : time} ${
                      time >= 12 ? "year" : "month"
                    } Old`
                  : "Last Orders"}
              </p>
              {time ? (
                <Link href={`?status=delivered&page=1`}>Last Orders</Link>
              ) : null}
              {times.map((data) =>
                time !== data ? (
                  <Link
                    key={data}
                    href={`?status=delivered&time=${data}&page=1`}
                  >
                    {data >= 12 ? data / 12 : data}
                    {data >= 12 ? " year" : " month"} Old
                  </Link>
                ) : null
              )}
            </label>
          ) : null}
          {typeOfStatus ? (
            <SearchOrders Fragment={Fragment} page={page} />
          ) : null}
        </div>
        <div className={style.orders}>
          {ordersLength > 0 ? (
            orders.map((order, index) => {
              const {
                _id,
                createdAt,
                status: orderStatus,
                current,
                iD,
                vD,
                qty,
                name,
                pId,
                statusUP,
                image,
                packaging,
                shipping,
                tofPay,
                cancelR,
              } = order;
              return (
                <div key={index} className={style.order}>
                  <div className={style.impInfo}>
                    <p>
                      <span>Order Placed:</span>
                      {dateFormatter.format(new Date(createdAt))}
                    </p>
                    <span>
                      ₹{" "}
                      {(
                        current * qty +
                        (shipping || 0) +
                        (packaging || 0)
                      ).toLocaleString("en-IN")}
                    </span>
                    {statusUP ? (
                      <p
                        style={{
                          color:
                            status === "delivered"
                              ? "green"
                              : status === "canceled"
                              ? "red"
                              : "white",
                        }}
                        className={style.updateStatus}
                      >
                        {status === "newOrder"
                          ? "Update Status"
                          : status == "canceled"
                          ? "Canceled"
                          : "Delivered"}
                        :{" "}
                        <span>{dateFormatter.format(new Date(statusUP))}</span>
                      </p>
                    ) : null}
                    {orderStatus ? (
                      <p className={style.status}>
                        Status:
                        <span> {orderStatus}</span>
                      </p>
                    ) : null}

                    <Link href={`order-details?k=${_id}`}>
                      View order details
                    </Link>
                  </div>

                  {cancelR ? (
                    <p className={style.cancelR}>
                      <span>Reason:</span>
                      {cancelR}
                    </p>
                  ) : null}
                  <Link className={style.imgLink} href={`/product?k=${name}`}>
                    <Image
                      src={image}
                      alt="product image"
                      height={150}
                      width={150}
                    />
                  </Link>
                  <Link className={style.name} href={`/product?k=${name}`}>
                    {name}{" "}
                    <span>
                      ({vD ? `${vD} >` : null} {iD !== "null" ? iD : null})
                    </span>
                  </Link>
                  {typeOfStatus ? (
                    <Link
                      id={style.writeReview}
                      className={style.button}
                      href={`review?k=${name}&img=${image}&p=${pId}`}
                    >
                      Write a product review
                    </Link>
                  ) : null}
                  {status === "newOrder" ? (
                    <Link
                      id={style.cancelBtn}
                      className={style.button}
                      href={`order-cancel?k=${_id}&n=${name}&i=${image}`}
                    >
                      Cancel Order
                    </Link>
                  ) : null}
                  <p>{tofPay}</p>
                </div>
              );
            })
          ) : (
            <p>Not Available</p>
          )}
        </div>
      </section>
    </Fragment>
  );
};

export default page;
