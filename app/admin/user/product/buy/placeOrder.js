"use client";
import { useRouter } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import style from "./placeOrder.module.css";
const PlaceOrder = ({ user, product, typesOfPay }) => {
  const {
    _id,
    totalStock,
    name,
    image,
    current,
    mrp,
    packaging,
    shipping,
    totalAmount,
    expectD,
    everyPC,
    tOfP,
    i,
    v,
    q,
    imageSetD,
  } = product;
  const { token, email, state, mobileNo, pinCode, district, address } = user;
  const router = useRouter();
  const [quantity, setQuantity] = useState(q);
  const [type, setType] = useState(typesOfPay[0]);
  const [quantityInput, setQuantityInput] = useState(false);
  const [quantitySubmit, setQuantitySubmit] = useState(false);
  if (!quantityInput) {
    if (quantity == 10) {
      setQuantityInput(true);
      setQuantity(11);
    }
  }
  if (quantity == 0 || quantity > totalStock) {
    setQuantity(totalStock);
  }
  if (quantity > totalStock) {
    alert(
      `Currently the stock of the product is ${totalStock} \n Contact Number ${process.env.PRODUCT_DELIVERY_INFORMATION_NUMBER}`
    );
  }
  useEffect(() => {
    if (setQuantitySubmit) {
      setQuantitySubmit(false);
    }
    if (quantity !== 1 && !quantityInput) {
      router.replace(
        `/admin/user/product/buy?p=${name}&q=${quantity}&i=${i}${
          v ? `&v=${v}` : ""
        }`
      );
    }
  }, [quantity]);
  const submitQuantity = () => {
    setQuantitySubmit(true);
    if (quantity !== 1) {
      router.replace(
        `/admin/user/product/buy?p=${name}&q=${quantity}&i=${i}${
          v ? `&v=${v}` : ""
        }`
      );
    }
    if (quantity == 1) {
      router.replace(
        `/admin/user/product/buy?p=${name}&i=${i}${v ? `&v=${v}` : ""}`
      );
    }
  };
  const orderConfirm = async () => {
    if (quantityInput && !quantitySubmit) {
      return alert("Please click the submit button");
    }
    const wait = document.querySelector("#wait").style;
    wait.display = "block";
    const order = await fetch(`/api/admin/user/product/order-create`, {
      method: "PUT",
      body: JSON.stringify({
        token,
        pId: _id,
        qty: quantity,
        shipping,
        packaging,
        state,
        district,
        name,
        mrp,
        current,
        address,
        image,
        pinCode,
        imageSetD,
        mNumber: mobileNo,
        tOfP,
        tofPay: type,
        expectD,
        iD: imageSetD ? i : undefined,
        vD: v,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { success, message } = await order.json();

    if (success) {
      setTimeout(() => {
        wait.display = "none";
        router.replace("/");
        alert(message);
      }, 2000);
    } else {
      wait.display = "none";
      alert(message);
      if (message === "token is expired") {
        return router.replace("/user/sign-up");
      }
    }
  };

  return (
    <Fragment>
      <span className={style.label} htmlFor="quantity">
        Qty:
        {quantityInput ? (
          <Fragment>
            <input
              onChange={(event) => setQuantity(event.target.value)}
              type="number"
              name="quantity"
              value={quantity}
              id="quantity"
            />
            <button onClick={submitQuantity} className={style.quantitySubmit}>
              Submit
            </button>
          </Fragment>
        ) : (
          <select
            value={quantity}
            id="quantity"
            name="quantity"
            onChange={(event) => setQuantity(event.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10+</option>
          </select>
        )}
      </span>
      <input
        className={style.orderPlaceBtn}
        type="checkbox"
        id="orderPlaceBtn"
        style={{ display: "none" }}
      />
      <label htmlFor="orderPlaceBtn" className={style.orderPlaceLabel}>
        Place your Order
      </label>

      <div className={style.typesOfPay}>
        <p className={style.typeOfPayLabel}>Types Of Payment</p>
        {typesOfPay.includes("Full Payment") ? (
          <span
            className={style.paymentButtons}
            onClick={() => setType("Full Payment")}
            style={{
              boxShadow:
                "Full Payment" === type
                  ? "1px 1px 1px 1px yellow"
                  : "1px 1px 1px 1px red",
            }}
          >
            Full Payment
          </span>
        ) : null}
        {type === "Full Payment" ? (
          <p className={style.fullPayment1}>
            Pay Amount: {totalAmount.toLocaleString("en-IN")}{" "}
          </p>
        ) : null}
        {typesOfPay.includes("Just Delivery / Packaging Charge") &&
        shipping &&
        packaging ? (
          <span
            className={style.paymentButtons}
            onClick={() => setType("Just Delivery / Packaging Charge")}
            style={{
              boxShadow:
                "Just Delivery / Packaging Charge" === type
                  ? "1px 1px 1px 1px yellow"
                  : "1px 1px 1px 1px red",
            }}
          >
            Just Delivery / Packaging Charge
          </span>
        ) : null}
        {type === "Just Delivery / Packaging Charge" ? (
          <Fragment>
            <p className={style.deliveryPackaging1}>
              Pay Amount: {(shipping + packaging).toLocaleString("en-IN")}
            </p>
            <p
              style={{ fontSize: "medium" }}
              className={style.deliveryPackaging2}
            >
              Delivery Time Payment:
              <span>
                {" "}
                {(totalAmount - (shipping + packaging)).toLocaleString("en-IN")}
              </span>
            </p>
          </Fragment>
        ) : null}

        {typesOfPay.includes("Cash on Delivery / Pay on Delivery") ? (
          <span
            className={style.paymentButtons}
            onClick={() => setType("Cash on Delivery / Pay on Delivery")}
            style={{
              boxShadow:
                "Cash on Delivery / Pay on Delivery" === type
                  ? "1px 1px 1px 1px yellow"
                  : "1px 1px 1px 1px red",
            }}
          >
            Cash on Delivery / Pay on Delivery
          </span>
        ) : null}
        {type === "Cash on Delivery / Pay on Delivery" ? (
          <button onClick={orderConfirm}>Confirm Payment</button>
        ) : null}
      </div>
    </Fragment>
  );
};

export default PlaceOrder;
