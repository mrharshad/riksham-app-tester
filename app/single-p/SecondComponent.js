"use client";
import { memo, useEffect } from "react";
import { useSelector } from "react-redux";
const DynamicComponent = () => {
  console.log("run memo component");

  const { data, uSos } = useSelector((data) => data.user);

  // const {
  //   email,
  //   pinCode: userPinCode,
  //   state: userState,
  //   district: userDistrict,
  // } = userInfo || {};

  // useEffect(() => {

  //   // window.addEventListener("popstate", () => {
  //   //   router.push("/");
  //   // });
  // }, []);
  return data;
};

export default memo(DynamicComponent);

// <div className={style.userPinCode} htmlFor="pinCode">
// <span
//   style={{
//     display: pinCodeLabel.success !== null ? "unset" : "none",
//   }}
// >
//   {pinCodeLabel.success ? "Available: " : "Not available: "}
// </span>
// <p>{pinCodeLabel.message}</p>
// <input
//   defaultValue={userPinCode}
//   placeholder="area pin"
//   onChange={checkDeliveryFunc}
//   type="number"
//   name="pinCode"
//   id="pinCode"
// />
// </div>
