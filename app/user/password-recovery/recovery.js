"use client";
import { Wait } from "@/app/Layouts/toastAndWait";
import React, { useRef, useState } from "react";
import style from "./recovery.module.css";
import { useRouter } from "next/navigation";
const Recovery = ({ token, Link }) => {
  const [wait, setWait] = useState(false);
  const password = useRef("");
  const confirmPassword = useRef("");
  const button = useRef();
  const router = useRouter();
  const setData = (e) => {
    const targe = e.target;
    const length = targe.value.length;
    const passValue = password.current.value;
    const confPassValue = confirmPassword.current.value;
    targe.style.outlineColor =
      length > 7
        ? "green"
        : length > 5
        ? "yellow"
        : length > 0
        ? "red"
        : "white";

    if (length > 7 && passValue === confPassValue) {
      button.current.style.visibility = "visible";
      button.current.style.opacity = 10;
    } else {
      button.current.style.visibility = "hidden";
      button.current.style.opacity = 0;
    }
  };
  const setPassword = async () => {
    const passValue = password.current.value;
    const confPassValue = confirmPassword.current.value;
    if (passValue.length > 7 && confPassValue === passValue) {
      setWait(true);
      const verify = await fetch(`/api/user/verification/recovery-password`, {
        method: "PUT",
        body: JSON.stringify({
          password: passValue,
          key: token,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { success, message } = await verify.json();
      alert(message);
      router.replace("/");
      router.refresh();
    } else {
      alert("check password");
    }
  };
  return (
    <section id="productUser" className={style.section}>
      {wait ? <Wait /> : null}
      <div className={style.container}>
        <h1>Your Password Recovery:</h1>
        <div className={style.password}>
          <label>Password:</label>
          <input ref={password} onChange={setData} type="password" />
        </div>
        <div className={style.confirmPassword}>
          <label>Re-enter:</label>
          <input ref={confirmPassword} onChange={setData} type="password" />
        </div>
        <button onClick={setPassword} ref={button} type="button">
          Set Password
        </button>
        <p>
          If you don't want to change the password:{" "}
          <Link href="/">click here</Link>
        </p>
      </div>
    </section>
  );
};

export default Recovery;
