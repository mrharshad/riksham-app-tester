"use client";
import React, { useRef, useState } from "react";
import style from "./cancel.module.css";
import Image from "next/image";
import { Wait } from "@/app/Layouts/toastAndWait";
import { useRouter } from "next/navigation";
export const Client = ({ name, image, token, orderId }) => {
  const [wait, setWait] = useState();
  const reasons = useRef();
  const router = useRouter();
  const reasonText = useRef();
  const [cancelReason, setCancelReason] = useState("Order Created By Mistake");
  async function cancelOrderFunc() {
    let cancelR = cancelReason;
    if (cancelReason === "Another") {
      cancelR = reasonText?.current?.value;
    }
    cancelR = cancelR.trim();
    if (cancelR.length < 10) {
      return alert("Give a little more reason");
    }
    setWait(true);
    const cancelProcess = await fetch(`/api/admin/user/product/order-cancel`, {
      method: "PUT",
      body: JSON.stringify({
        token,
        orderId,
        cancelR,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { success, message } = await cancelProcess.json();

    if (success) {
      router.replace("/admin/user/product/orders?status=canceled");
    } else {
      setWait(false);
      alert(message);
    }
  }
  const createReason = (e) => {
    reasons.current.style.maxHeight = "30px";
    setCancelReason(e.target.textContent);
  };
  const reasonsOpts = [
    "Order Created By Mistake",
    "Item Would Not Arrive On Time",
    "Shipping Cost Too High",
    "Item Price Too High",
    "Packaging Cost Too High",
    "Another",
  ];
  return (
    <section id="productUser" className={style.section}>
      {wait ? <Wait /> : null}
      <form className={style.form}>
        <h1> {name}</h1>
        <Image src={image} alt="product image" height={200} width={200} />
        <h2>Why want to cancel</h2>
        <div ref={reasons} className={style.reasons}>
          <p
            onClick={() => {
              let style = reasons.current.style;
              if (style.maxHeight == "30px") {
                style.maxHeight = "300px";
              } else {
                style.maxHeight = "30px";
              }
            }}
          >
            {cancelReason} <span>▼</span>
          </p>
          {reasonsOpts.map((opt) => (
            <span
              key={opt}
              style={
                cancelReason == opt
                  ? {
                      backgroundColor: "#d0d5d5",
                    }
                  : null
              }
              onClick={createReason}
            >
              {opt}
            </span>
          ))}
        </div>
        {cancelReason === "Another" ? (
          <textarea
            ref={reasonText}
            placeholder="enter your reason..."
            maxLength={100}
            cols="30"
            rows="10"
          ></textarea>
        ) : null}
        <button type="button" onClick={cancelOrderFunc}>
          Cancel Order
        </button>
      </form>
      ;
    </section>
  );
};

// <select
// defaultValue="Order Created By Mistake"
// name="reason"
// id="reason"
// >
// <option value="Order Created By Mistake">
//   Order Created By Mistake
// </option>
// <option value="Item Would Not Arrive On Time">
//   Item Would Not Arrive On Time
// </option>
// <option value="Shipping Cost Too High">Shipping Cost Too High</option>
// <option value="Item Price Too High">Item Price Too High</option>
// <option value=" Packaging Cost Too High">
//   Packaging Cost Too High
// </option>
// </select>
