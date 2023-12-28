"use client";
import { useRef, useState } from "react";
import style from "./verification.module.css";
import { useRouter } from "next/navigation";
import { Wait } from "@/app/Layouts/toastAndWait";

const Verification = ({ firstStep }) => {
  const router = useRouter();
  const [wait, setWait] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const tokenInput = useRef();

  const secondStep = async () => {
    const token = tokenInput.current.value.trim();
    if (token.length !== 6) {
      return alert("check 6 digit verification code");
    }
    if (password !== confirmPassword || password.length == 0) {
      return alert("Check Password");
    }
    setWait(true);
    const verify = await fetch(`/api/user/verification/email-token-verify`, {
      method: "POST",
      body: JSON.stringify({
        password,
        userType: token,
        firstStep,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { message, success } = await verify.json();
    alert(message);
    if (success) {
      router.replace("/");
      router.refresh();
    } else {
      router.refresh();
      setWait(false);
    }
  };

  const reSendToken = async () => {
    setWait(true);
    const verificationCode = await fetch(
      `/api/user/verification/email-token-send`,
      {
        method: "POST",
        body: JSON.stringify({
          firstStep,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { success, message } = await verificationCode.json();
    alert(message);
    if (success) {
      router.refresh();
      setWait(false);
    } else {
      router.refresh();
      setWait(false);
    }
  };
  function funcSetPassword(e) {
    const input = e.target.value;
    let length = input.length;
    const inputName = e.target.name;
    if (input.includes(" ")) {
      e.target.value = input.trim();
      return alert("space not allow");
    }

    if (inputName === "confirmPassword") {
      setConfirmPassword(input);
    } else {
      setPassword(input);
    }

    if (password.length == 0 || confirmPassword.length == 0 || length == 0) {
      e.target.style.borderColor =
        length > 7
          ? "green"
          : length > 5
          ? "yellow"
          : length > 0
          ? "red"
          : "transparent";
    } else {
      const data =
        password.length < confirmPassword.length ? confirmPassword : password;
      for (let i = 0; i < length; i++) {
        if (data.charAt(i) === input.charAt(i)) {
          e.target.style.borderColor = "green";
        } else {
          if (length > 0) {
            e.target.style.borderColor = "red";
          } else {
            e.target.style.borderColor = "transparent";
          }
          length = 0;
        }
      }
    }
  }
  return (
    <section className={style.section}>
      {wait ? <Wait /> : null}
      <form className={style.secondStep}>
        <p>Almost Done</p>
        <p className={style.identity}>
          identity: <span>{firstStep.email}</span>
        </p>
        <div className={style.checkMail}>
          <p>Check your mail inbox</p>
          <p></p>
        </div>
        <label htmlFor="password">Password</label>
        <input
          onChange={funcSetPassword}
          required
          name="password"
          id="password"
          minLength={8}
          type="password"
          placeholder="greater than 8 characters "
        />
        <label htmlFor="password">Confirm Password</label>
        <input
          onChange={funcSetPassword}
          required
          id="confirm"
          name="confirmPassword"
          minLength={8}
          type="password"
          placeholder="greater than 8 characters "
        />
        <label className={style.verifyLabel} htmlFor="password">
          Enter 6 digit verification code
          <input
            className={style.verifyInput}
            ref={tokenInput}
            required
            id="token"
            minLength={6}
            maxLength={6}
            type="text"
          />
        </label>
        <p className={style.resend}>
          Verification Code:{" "}
          <span onClick={reSendToken} type="button">
            re-send
          </span>
        </p>
        <button
          style={{
            background: `linear-gradient(to left bottom, #a9b8f3, ${
              password === confirmPassword && password.length > 0
                ? "green"
                : "red"
            })`,
          }}
          onClick={secondStep}
          type="button"
        >
          Done
        </button>
      </form>
    </section>
  );
};

export default Verification;
