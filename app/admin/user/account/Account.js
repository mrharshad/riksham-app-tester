"use client";
import { useDispatch, useSelector } from "react-redux";
import style from "./accounts.module.css";
import Link from "next/link";
import { logOut, userKeyChange } from "@/app/redux/slice/user";
import { useEffect } from "react";
import { UserAlert, Wait } from "@/app/Layouts/toastAndWait";
import { useRouter } from "next/navigation";

export default function Account() {
  const { data, uSos } = useSelector((data) => data.user);
  const rootPath = new String("/admin/user/account");
  const {
    fName,
    lName,
    mobileNo,
    gender,
    bDate,
    bMonth,
    bYear,
    location = [],
    email = "",
  } = data || {};
  const dispatch = useDispatch();
  const birth = `${bDate}-${bMonth}-${bYear}`;
  const { _id, state, district, pinCode, address } = location[0] || {};
  const router = useRouter();
  useEffect(() => {
    if (uSos?.type) {
      const { type, message } = uSos;
      setTimeout(() => {
        if (message == "token is expired") {
          router.replace("/user/login");
        }
        if (message.includes("successfully")) {
          router.replace("/");
        }

        dispatch(userKeyChange({ name: "uSos", value: false }));
      }, uSos?.time || 2000);
    }
  }, [uSos]);

  const useWait = (value) => {
    dispatch(
      userKeyChange({
        name: "uSos",
        value,
      })
    );
  };

  return (
    <>
      {uSos && <Wait />}
      {uSos?.type && UserAlert(uSos)}
      <div className={style.option}>
        <p>
          My Details :<Link href={`${rootPath}/details`}>Edit</Link>
        </p>

        <span> First Name : {fName}</span>
        <span> Last Name : {lName}</span>
        <span> Mobile Number : {mobileNo}</span>
        <span> Gender : {gender}</span>
        <span> Date Of Birth : {birth}</span>
      </div>
      <div className={style.option}>
        <p>
          Password & Verification :
          <Link href={`${rootPath}/security`}>Edit</Link>
        </p>

        <span>Changes can be made here only if you remember the password.</span>
      </div>
      <div className={style.option}>
        <p>
          Primary Address : {location.length}
          <Link href={`${rootPath}/address`}>Edit</Link>
        </p>
        <span>PinCode: {pinCode}</span>
        <span>District: {district}</span>
        <span>State: {state}</span>
        <span>Place: {address}</span>
      </div>
      <div className={style.option}>
        <p>
          Manage Interested Product :{" "}
          <Link href={`${rootPath}/p-suggestion`}>Edit</Link>
        </p>
        <span>
          You can add or remove any type of product with your suggestion.
        </span>
      </div>
      <div className={style.option}>
        <p>
          {email.substring(0, 23)}:
          <Link href={`${rootPath}/change-email`}>Edit</Link>
        </p>
        <span>
          The new email ID will be verified only if the password is remembered..
        </span>
      </div>
      <div className={style.option}>
        <p>
          <Link href={`${rootPath}/delete`}>Delete</Link>
          My Account Permanently :
        </p>
        <span>Deleting your account will delete your order history</span>
      </div>

      <button
        onClick={async () => {
          useWait(true);
          const request = await fetch(`/api/admin/user/log-out`);
          const { success, message } = await request.json();
          if (success) {
            setTimeout(() => {
              dispatch(logOut());
              router.replace("/");
            }, 2000);
          }
          useWait({ type: success ? "Success" : "Error", message });
        }}
        className={style.logOut}
        type="button"
      >
        Log Out
      </button>
    </>
  );
}
