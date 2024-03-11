"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import style from "./page.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
const ClientComponent = ({ ordersData, page, token, status }) => {
  let [data, setData] = useState();
  let [details, setDetails] = useState();
  const [wait, setWait] = useState(false);
  const orderStatus = useRef();
  const cancelR = useRef();
  const router = useRouter();
  const dateFormatter = new Intl.DateTimeFormat("en-In", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const singleArray = ["out for delivery", "dispatch", "confirm", "pending"];
  let statusName = singleArray.includes(status) ? "newOrder" : status;
  const orderStatusFunction = (e) => {
    router.push(
      `/admin/product-manager/orders-received-cancel?status=${e.target.value}`
    );
  };
  useEffect(() => {
    setData(false);
  }, [ordersData]);

  const updateStatusFunction = async (
    newStatus,
    userId,
    index,
    orderId,
    orderInfo,
    pinCode
  ) => {
    const body = {
      newStatus,
      token,
    };
    const check = singleArray.includes(newStatus);

    if (newStatus === "canceled") {
      body.cancelR = cancelR.current?.value;
      body.details = details || orderInfo;
    } else {
      body.pinCode = pinCode;
      body.userId = userId;
      body.orderId = orderId;
    }

    setWait(index || 0);

    const ordersStatus = await fetch(
      `${process.env.PROTOCOL_AND_HOST}/api/admin/product-manager/${
        newStatus == "delivered"
          ? "delivered"
          : check
          ? "update-status"
          : "cancel"
      }`,
      {
        method: "PUT",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await ordersStatus.json();

    const { success, message } = result;

    if (success) {
      setWait(false);
      if (details) {
        setDetails();
      }
      setData(
        (data || ordersData).filter((data) => {
          return data.newOrder._id !== orderId;
        })
      );
      alert(message);
    } else {
      alert(message);
      setWait(false);
    }
  };
  return (
    <section id="productManagersPanels" className={style.section}>
      <h1 className={style.h1}>Your District Orders</h1>
      <select
        defaultValue={status}
        className={style.select}
        onChange={orderStatusFunction}
        ref={orderStatus}
      >
        <option value="pending">Pending</option>
        <option value="confirm">Confirm</option>
        <option value="dispatch">Dispatch</option>
        <option value="out for delivery">Out For Delivery</option>
        <option value="delivered">Delivered</option>
        <option value="canceled">Canceled</option>
      </select>
      {details ? (
        <form
          className={style.cancelReasonDiv}
          onSubmit={() => updateStatusFunction("canceled")}
        >
          <svg
            className={style.cancelReasonClose}
            onClick={() => setDetails(false)}
            width="40"
            height="40"
            viewBox="0 0 24 24"
            id="close"
          >
            <path fill="none" d="M0 0h24v24H0V0z"></path>
            <path
              fill="#FF0000"
              d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"
            ></path>
          </svg>
          <p className={style.label}>
            Told what is the reason for cancellation
          </p>
          <p className={style.name}>{details.name}</p>
          <textarea
            autoFocus
            required
            ref={cancelR}
            minLength={10}
            maxLength={100}
            name="cancelR"
            id="cancelR"
            cols="30"
            rows="5"
            placeholder="mention the reason..."
          />
          {wait ? (
            <p className={style.wait}></p>
          ) : (
            <button type="submit">Submit</button>
          )}
        </form>
      ) : null}
      {data?.length > 0 || ordersData.length > 0 ? (
        <div className={style.ordersContainer}>
          {(data || ordersData).map((data, index) => {
            const { _id: userId, [statusName]: orderDetails } = data;
            const {
              _id,
              name,
              createdAt,
              image,
              cancelR,
              qty,
              pId,
              address,
              expectD,
              tofPay,
              packaging,
              shipping,
              tOfP,
              vD,
              iD,
              current,
              pinCode,
              statusUP,
              imageSetD,
              mNumber,
            } = orderDetails;
            const activateButtons =
              status !== "delivered" && status !== "canceled";
            const newStatus =
              status === "pending"
                ? "confirm"
                : status === "confirm"
                ? "dispatch"
                : status === "dispatch"
                ? "out for delivery"
                : status === "out for delivery"
                ? "delivered"
                : null;
            return (
              <div className={style.order} key={index}>
                <p className={style.name}>{name}</p>
                <Image
                  src={image}
                  width={100}
                  height={100}
                  alt="Product Image"
                />
                {activateButtons ? (
                  <button
                    onClick={() => {
                      orderDetails.userId = userId;
                      setDetails(orderDetails);
                    }}
                    className={style.cancelBtn}
                    type="button"
                  >
                    Cancel Order
                  </button>
                ) : wait.pId === pId && wait.userId === userId ? (
                  <p className={style.wait}></p>
                ) : null}
                <p className={style.pinCode}>PinCode: {pinCode}</p>

                {activateButtons && wait !== index ? (
                  <button
                    onClick={() => {
                      orderDetails.userId = userId;
                      updateStatusFunction(
                        newStatus,
                        userId,
                        index,
                        _id,
                        orderDetails,
                        pinCode
                      );
                    }}
                    className={style.updateBtn}
                    type="button"
                  >
                    {newStatus}
                  </button>
                ) : wait === index ? (
                  <span className={style.wait}></span>
                ) : null}
                <p className={style.typeOfProduct}>Product: {tOfP}</p>
                <p className={style.orderCreateAt}>
                  Order Placed:{" "}
                  <span>{dateFormatter.format(new Date(createdAt))}</span>
                </p>
                {status == "canceled" ? (
                  <p className={style.cancelReason}>
                    Reason: <span>{cancelR}</span>
                  </p>
                ) : null}
                <p>Quantity: {qty}</p>

                <p>Price: ₹ {current?.toLocaleString("en-IN")}</p>
                <p>
                  Shipping: ₹ {shipping ? shipping?.toLocaleString("en-IN") : 0}{" "}
                </p>
                <p>
                  Packaging: ₹{" "}
                  {packaging ? packaging?.toLocaleString("en-IN") : 0}{" "}
                </p>
                {vD ? <p>VD: {vD}</p> : null}
                {imageSetD ? (
                  <p>
                    {imageSetD}: {iD}
                  </p>
                ) : null}
                {status === "canceled" || status === "delivered" ? (
                  <p className={style.expectDelivery}>
                    {status}:{" "}
                    <span>{dateFormatter.format(new Date(statusUP))}</span>
                  </p>
                ) : (
                  <p className={style.expectDelivery}>
                    Expect Delivery: <span>{expectD}</span>
                  </p>
                )}

                <p className={style.address}>
                  Address: <span>{address}</span>{" "}
                </p>
                <p className={style.address}>
                  Contact: <span>{mNumber}</span>{" "}
                </p>
                <p className={style.typeOfPayment}>
                  Type Of Pay: <span>{tofPay}</span>
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={style.notFound}>Order status not found</p>
      )}
    </section>
  );
};

export default ClientComponent;
