"use client";
import { useRef, useState } from "react";
import style from "./login.module.css";
import { Wait } from "@/app/Layouts/toastAndWait";
import { useRouter } from "next/navigation";

const LoginUser = ({ Link }) => {
  const router = useRouter();
  const email = useRef();
  const password = useRef();
  const [wait, setWait] = useState(false);

  const inputData = async (event) => {
    setWait(true);
    event.preventDefault();
    const emailValue = email.current.value;
    const passwordValue = password.current.value;
    let user = await fetch(`/api/user/login`, {
      method: "POST",
      body: JSON.stringify({
        email: emailValue,
        password: passwordValue,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    user = await user.json();
    const { success, message } = user;
    if (success) {
      alert(message);
      router.replace("/");
      router.refresh();
    } else {
      setWait(false);
      if (message === "not verified your email") {
        router.replace("/user/sign-up");
      }
      alert(message);
    }
  };
  const forgotPassword = async () => {
    const emailValue = email.current.value;
    if (emailValue === "") {
      return alert("please enter email");
    }
    setWait(true);
    let user = await fetch(`/api/user/recovery/password`, {
      method: "PUT",
      body: JSON.stringify({
        email: emailValue,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    user = await user.json();
    if (user.success) {
      alert(user.message);
      setTimeout(() => router.replace("/"), 2000);
    } else {
      setWait(false);
      alert(user.message);
    }
  };
  return (
    <section className={style.section}>
      {wait ? <Wait /> : null}
      <form className={style.form} onSubmit={inputData}>
        <h1>Login</h1>
        <p>Get access to your Orders, Wishlist and Recommendations</p>
        <label htmlFor="email">Email</label>
        <input
          ref={email}
          name="email"
          required
          id="email"
          type="email"
          placeholder="enter name"
        />
        <label htmlFor="password">
          Password{" "}
          <span onClick={forgotPassword} className={style.forgotPassword}>
            Forgot Password
          </span>
        </label>
        <input
          ref={password}
          name="password"
          required
          id="password"
          type="password"
          placeholder="enter surname"
        />
        {wait ? (
          <p className={style.wait}></p>
        ) : (
          <button className={style.login} type="submit">
            Login
          </button>
        )}

        <p>
          By continuing, you agree to riksham's
          <Link href="/user/conditions"> Conditions of Use </Link> and
          <Link href="/user/privacy-policy"> Privacy Notice </Link>.
        </p>
        <Link href="/user/sign-up">Create new account</Link>
      </form>
    </section>
  );
};

export default LoginUser;
