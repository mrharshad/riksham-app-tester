import React, { Fragment } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import style from "./productBuy.module.css";
import Image from "next/image";
import PlaceOrder from "./placeOrder";
import { notFound, redirect } from "next/navigation";
import { Wait } from "@/app/Layouts/toastAndWait";
export const metadata = {
  title: "Buy Product",
};

const BuyNow = async ({ searchParams }) => {
  let { p, q, i, v } = searchParams;
  q = Number(q) || 1;
  const cookieStore = cookies();
  const value = cookieStore.get(process.env.COOKIE_TOKEN_NAME)?.value;
  const validation = cookieStore.get("userInfoRevalidate")?.value;

  if (!value) {
    redirect("/user/sign-up");
  }
  const user = await fetch(
    `${
      process.env.PROTOCOL_AND_HOST
    }/api/admin/user/account?token=${value}&validation=${
      validation || "newData"
    }`,
    { cache: "no-cache" }
    // { next: { revalidate: 21600 } }
  );
  const { message: userMessage, data } = await user.json();
  if (userMessage) {
    redirect("/user/login");
  }
  const {
    fName,
    lName,
    mobileNo,
    email,
    address,
    pinCode,
    state: userState,
    district: userDistrict,
  } = data;
  const request = await fetch(
    `${process.env.PROTOCOL_AND_HOST}/api/product/help/delivery-service?pinCode=${pinCode}`,
    {
      cache: "no-cache",
    }
  );
  const result = await request.json();

  if (!result.success) {
    return redirect(
      `/admin/user/edit-details?msg=Change pin code of your area`
    );
  }
  const requestP = await fetch(
    `${process.env.PROTOCOL_AND_HOST}/api/product/single-product/${p}`,
    { cache: "no-cache" }
    // { next: { revalidate: 21600 } }
  );

  const { product, success, message } = await requestP.json();
  if (!success) {
    return <h1 className={style.userPinCodeWrong}>{requestProduct.message}</h1>;
  }
  let {
    _id,
    everyPC,
    payType,
    packaging,
    shipping,
    variants,
    imageSets,
    variantD,
    tOfP,
    imageSetD,
  } = product || {};
  if (!_id) {
    return notFound();
  }
  const findVariant = variants.find((variant) => variant.vD === v);
  const findColor = findVariant?.options.find((opt) => opt.optID === i);
  if (!findColor) {
    return redirect(`/product?k=${p}`);
  }
  const image = imageSets.find((color) => color.iD === i).images[0].url;
  let { current, mrp, loc } = findColor;
  let stateStock = 0;
  let districtStock = 0;
  let totalStock = 0;

  for (let sta of loc) {
    const { s, d } = sta;
    for (let dis of d) {
      const { dN, qty } = dis;

      if (s === userState) {
        stateStock += qty;
      }
      if (dN === userDistrict) {
        districtStock += qty;
      }
      totalStock += qty;
    }
  }

  if (totalStock < q) {
    redirect(
      `/admin/user/product/buy?p=${p}&q=${1}&i=${i}${v ? `&v=${v}` : ""}`
    );
  }
  shipping = shipping && everyPC ? shipping * q : shipping ? shipping : 0;
  packaging = packaging && everyPC ? packaging * q : packaging ? packaging : 0;

  mrp = mrp * q;
  const totalAmount = shipping + packaging + current * q;
  const discount = (((mrp - totalAmount) / mrp) * 100).toFixed(2);
  const dateFormatter = new Intl.DateTimeFormat("en-In", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  function expectMin(time) {
    const minimumDays = new Date(
      Date.now() +
        5.5 * 60 * 60 * 1000 +
        24 *
          60 *
          60 *
          1000 *
          (time === "district" ? 4 : time === "state" ? 8 : 10)
    );
    return `${dateFormatter.format(minimumDays).slice(0, -4)} `;
  }
  function expectMax(time) {
    const maximumDays = new Date(
      Date.now() +
        5.5 * 60 * 60 * 1000 +
        24 *
          60 *
          60 *
          1000 *
          (time === "district" ? 5 : time === "state" ? 10 : 14)
    );
    return `${dateFormatter.format(maximumDays)}`;
  }
  const expectD =
    q <= districtStock
      ? `${expectMin("district")}to ${expectMax("district")}`
      : q <= stateStock
      ? `${expectMin("state")}to ${expectMax("state")}`
      : `${expectMin("country")}to ${expectMax("country")}`;

  return (
    <Fragment>
      <div style={{ display: "none" }} id="wait">
        <Wait />
      </div>
      <section id="productUser" className={style.section}>
        <div className={style.maiContainer}>
          <h1 className={style.h1}>
            {p}
            {variantD ? (
              <span>
                {variantD}: {v}
              </span>
            ) : null}
            {imageSetD ? (
              <span>
                {imageSetD}: {i}
              </span>
            ) : null}
          </h1>
          <div className={style.imgCover}>
            <Image alt="Product image" height={300} width={300} src={image} />
          </div>
          <div className={style.orderSummary}>
            <h2 className={style.h2}>Order Summary</h2>
            <p>
              product:
              <span>
                ₹{current.toLocaleString("en-IN")} x {q}
              </span>
            </p>
            <p>
              Delivery :
              <span>
                ₹
                {everyPC && shipping && q > 1
                  ? `${(shipping / q).toLocaleString("en-IN")} x ${q}`
                  : shipping}
              </span>
            </p>
            <p>
              Packaging :
              <span>
                ₹
                {everyPC && packaging && q > 1
                  ? `${(packaging / q).toLocaleString("en-IN")} x ${q}`
                  : packaging}
              </span>
            </p>
            <p className={style.totalAmount}>
              Total Amount:
              <span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </p>
            <p className={style.savings}>
              Your Savings :
              <span>
                ₹
                {(mrp - totalAmount > 1 ? mrp - totalAmount : 0).toLocaleString(
                  "en-IN"
                )}
              </span>
              <span>-{mrp - totalAmount > 1 ? discount : 0}%</span>
            </p>
            <PlaceOrder
              user={{
                token: value,
                mobileNo,
                district: userDistrict,
                pinCode,
                state: userState,
                address,
                email,
              }}
              typesOfPay={payType}
              product={{
                imageSetD,
                _id,
                totalStock,
                name: p,
                image,
                current,
                mrp: mrp / q,
                packaging,
                shipping,
                totalAmount,
                expectD,
                everyPC,
                tOfP,
                i,
                v,
                q,
              }}
            />
            <span>
              By placing your order, you agree to Website's
              <Link href={"/"}>privacy notice</Link>
              and <Link href={"/"}>conditions of use</Link>.
            </span>
          </div>
          <div className={style.invoiceInfo}>
            <h3 className={style.h3}>Invoice And Delivery Information</h3>

            <h4 className={style.h4}>
              Delivery Date: <span>{expectD}</span>{" "}
            </h4>

            <p>
              Full Name:
              <span>
                {fName} {lName}
              </span>
            </p>
            <p>
              Mobile Number:
              <span>{mobileNo}</span>
            </p>

            <p>
              Email: <span> {email} </span>
            </p>
            <p>
              PinCode: <span> {pinCode} </span>
            </p>
            <p>
              State: <span> {userState} </span>
            </p>
            <p>
              District: <span> {userDistrict} </span>
            </p>
            <p>
              Address: <span> {address} </span>
            </p>
          </div>

          <div className={style.typesOfPayment}>
            <p className={style.paymentMethod}>Payment Method</p>
            <p className={style.bankInstructions}>
              Bank Transfer Instructions: (NO TRANSITION CHARGE)
            </p>
            <p className={style.notice1}>
              Please transfer the pay amount to the following bank account
            </p>
            <p className={style.upiMethod}>BHIM/UPI ID:- riksham.com@ybl</p>
            <p className={style.bankACName}>
              ACCOUNT HOLDER NAME:- Harshad Sahu
            </p>
            <p className={style.bankACNo}>ACCOUNT NUMBER:- 6127020100007572</p>
            <p className={style.bankACISFC}>ISFC CODE:- UBIN0561274</p>
            <p>SEND US THE CONFIRMATION / SCREENSHOT WITH THE ORDER ID ON</p>
            <a
              className={style.sendScreenShort1}
              href="mailto:rikshamsahu@gmail.com"
            >
              Mail: <span>rikshamsahu@gmail.com</span>
            </a>
            <a className={style.sendScreenShort2} href="tel:7771998614">
              Whatsapp: <span> 7771998614</span>
            </a>
            <p>FROM YOUR REGISTERED EMAIL OR MOBILE NUMBER.</p>
            <Image
              src={
                "https://res.cloudinary.com/duxuhsx8x/image/upload/v1692605694/SiteImages/gt37boidbanznhpahh6x.png"
              }
              alt="bar code"
              height={150}
              width={150}
            />
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default BuyNow;
