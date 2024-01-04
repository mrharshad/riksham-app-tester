import React, { Fragment } from "react";
import { cookies } from "next/headers";
import style from "./accounts.module.css";
import Link from "next/link";
import LogOutBtn from "./logOutBtn";
import { redirect } from "next/navigation";
import client from "@/backend/config/redisConnect";
import jwt from "jsonwebtoken";

export const metadata = {
  title: "User Accounts",
};

const UserAccount = async () => {
  const cookieStore = cookies();
  const value = cookieStore.get(process.env.COOKIE_TOKEN_NAME)?.value;
  if (!value) {
    redirect("/user/sign-up");
  }

  const { _id } = jwt.verify(value, process.env.JWT_SECRET_CODE);

  if (!_id) {
    redirect("/user/login");
  }
  let user = await client.hGetAll(`user:${_id}`);

  if (!user._id) {
    const validation = cookieStore.get("userInfoRevalidate")?.value;
    user = await fetch(
      `${
        process.env.PROTOCOL_AND_HOST
      }/api/admin/user/account?token=${_id}&validation=${
        validation || "newData"
      }`,
      { cache: "no-cache" }
      // { next: { revalidate: 21600 } }
    );
    const { success, message, data } = await user.json();

    delete data.__v;
    data.role = JSON.stringify(data.role);
    data.cartPro = JSON.stringify(data.cartPro);
    data.sugPC = JSON.stringify(data.sugPC);
    data.newOrder = JSON.stringify(data.newOrder);
    data.canceled = JSON.stringify(data.canceled);
    data.reOSP = JSON.stringify(data.reOSP);

    await client.hSet(`user:${_id}`, data);
    await client.expire(`user:${_id}`, 86400);

    user = data;
  }

  user.role = eval(user.role);

  const {
    role,
    fName,
    email,
    lName,
    mobileNo,
    createdAt,
    state,
    pinCode,
    address,
    district,
    gender,
    bDate,
    bMonth,
    bYear,
  } = user;

  return (
    <Fragment>
      <section id="productUser" className={style.section}>
        <div className={style.container}>
          <Link
            target="_blank"
            href="edit-details"
            className={style.editAccountLink}
          >
            <svg x="0px" y="0px" width="20" height="20" viewBox="0 0 40 40">
              <path
                fill="#00bfff"
                d="M5.982 29.309L8.571 26.719 13.618 31.115 10.715 34.019 2.453 37.547z"
              ></path>
              <path
                fill="#00bfff"
                d="M8.595,27.403l4.291,3.737l-2.457,2.457l-7.026,3.001l3.001-7.003L8.595,27.403 M8.548,26.036 l-2.988,2.988l-4.059,9.474L11,34.44l3.351-3.351L8.548,26.036L8.548,26.036z"
              ></path>
              <path
                fill="#00bfff"
                d="M3.805 33.13L1.504 38.5 6.888 36.201z"
              ></path>
              <path
                fill="#00bfff"
                d="M30.062,5.215L32.3,2.978C32.931,2.347,33.769,2,34.66,2s1.729,0.347,2.36,0.978 c1.302,1.302,1.302,3.419,0,4.721l-2.237,2.237L30.062,5.215z"
              ></path>
              <path
                fill="#00bfff"
                d="M34.66,2.5c0.758,0,1.471,0.295,2.007,0.831c1.107,1.107,1.107,2.907,0,4.014l-1.884,1.884 L30.77,5.215l1.884-1.884C33.189,2.795,33.902,2.5,34.66,2.5 M34.66,1.5c-0.982,0-1.965,0.375-2.714,1.124l-2.591,2.591 l5.428,5.428l2.591-2.591c1.499-1.499,1.499-3.929,0-5.428v0C36.625,1.875,35.643,1.5,34.66,1.5L34.66,1.5z"
              ></path>
              <g>
                <path
                  fill="#00FFFF"
                  d="M11.346,33.388c-0.066-0.153-0.157-0.308-0.282-0.454c-0.31-0.363-0.749-0.584-1.31-0.661 c-0.2-1.267-1.206-1.803-1.989-1.964c-0.132-0.864-0.649-1.342-1.201-1.582l21.49-21.503l4.721,4.721L11.346,33.388z"
                ></path>
                <path
                  fill="#4788c7"
                  d="M28.054,7.931l4.014,4.014L11.431,32.594c-0.242-0.278-0.638-0.59-1.261-0.748 c-0.306-1.078-1.155-1.685-1.983-1.943c-0.151-0.546-0.447-0.968-0.821-1.272L28.054,7.931 M28.053,6.517L5.56,29.023 c0,0,0.007,0,0.021,0c0.197,0,1.715,0.054,1.715,1.731c0,0,1.993,0.062,1.993,1.99c1.982,0,1.71,1.697,1.71,1.697l22.482-22.495 L28.053,6.517L28.053,6.517z"
                ></path>
              </g>
              <g>
                <path
                  fill="#Ffff00"
                  d="M29.107 4.764H34.685V11.440999999999999H29.107z"
                  transform="rotate(-45.009 31.895 8.103)"
                ></path>
                <path
                  fill="#Ffff00"
                  d="M31.507,4.477l4.014,4.014l-3.237,3.237L28.27,7.714L31.507,4.477 M31.507,3.063l-4.651,4.651 l5.428,5.428l4.651-4.651L31.507,3.063L31.507,3.063z"
                ></path>
              </g>
            </svg>
            Edit account
          </Link>
          <h5>
            Hello:_
            <span>
              {fName} {lName}
            </span>
          </h5>

          <p>
            <span>Email: </span>
            {email}
          </p>
          <p>
            <span>Mobile: </span>
            {mobileNo}
          </p>
          <p>
            <span>Address: </span>
            {address}
          </p>

          <div className={style.pinCodeComponent}>
            <p>
              <span>State: </span>
              {state}
            </p>
            <p>
              <span>District: </span>
              {district}
            </p>
            <p>
              <span>PinCode: </span>
              {pinCode}
            </p>
            <p>
              <span>Date Of Birth: </span>
              {bDate} - {bMonth} - {bYear}
            </p>
            <p>
              <span>Gender: </span>
              {gender}
            </p>
            <p>
              <span>User Created: </span>
              {createdAt}
            </p>
          </div>

          <h4>Data and Privacy</h4>
          <Link className={style.sellerDashboard} href="/user/privacy-policy">
            Privacy Notice
          </Link>
          <Link className={style.sellerDashboard} href="account/close">
            Close Your riksham account
          </Link>
          <LogOutBtn />
        </div>
        {role.length > 1 ? (
          <div className={style.team}>
            <h2>Your role in the company: </h2>

            {role.includes("Product Inventory Manager") ? (
              <div>
                <p>Product Inventory Manager</p>
                <Link
                  target="_blank"
                  href="/admin/product-inventory-manager/create"
                >
                  Create New Product And Variant
                </Link>
                <Link
                  target="_blank"
                  href="/admin/product-inventory-manager/update"
                >
                  Product Update And Delete Variant
                </Link>
              </div>
            ) : null}
            {role.includes("Product Manager") ? (
              <div>
                <p>Product Manager</p>
                <Link
                  target="_blank"
                  href="/admin/product-manager/orders-received-cancel"
                >
                  Product Orders Received / Cancel
                </Link>
              </div>
            ) : null}
            {role.includes("Senior Product Manager") ? (
              <div className={style.seniorProductManager}>
                <p>Senior Product Manager</p>
                <Link
                  target="_blank"
                  href="/admin/senior-product-manager/product-delete-and-update-price-stock"
                >
                  Product delete / Update price/stocks
                </Link>
                <Link
                  target="_blank"
                  href="/admin/senior-product-manager/create-product-order"
                >
                  Create Product Order Manually
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </Fragment>
  );
};

export default UserAccount;
