"use client";
import React, { useEffect, useState } from "react";
import style from "./imageButton.module.css";
import { useRouter } from "next/navigation";
import { Wait } from "../Layouts/toastAndWait";

const ImageButton = ({
  token,
  options,
  variantD,
  imageSets,
  productName,
  Image,
  Fragment,
  userInfo,
  imageSetD,
  vD,
}) => {
  const router = useRouter();
  const {
    email,
    pinCode: userPinCode,
    state: userState,
    district: userDistrict,
  } = userInfo || {};
  const LabelText = {
    success: null,
    message: "Enter the pin code of the delivery location:",
  };
  const [wait, setWait] = useState();
  const [openColor, setOpenColor] = useState({ index: 0 });
  const [pinCodeLabel, setPinCodeLabel] = useState(LabelText);
  const [deliveryTime, setDeliveryTime] = useState();
  const checkDeliveryService = async (pinCode) => {
    const request = await fetch(`/api/product-help/delivery-service`, {
      method: "POST",
      body: JSON.stringify({ pinCode }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await request.json();
    setPinCodeLabel(result);
  };

  const optionLength = options.length;
  const {
    mrp,
    current,
    optID: openedColor,
    loc,
  } = options[optionLength > openColor.index ? openColor.index : 0];
  useEffect(() => {
    let findState = false;
    let findDistrict = loc.some((sta) => {
      if (sta.s === userState) {
        findState = true;
        return sta.d.some((dis) => dis.dN === userDistrict && dis.qty > 0);
      }
    });
    if (userPinCode) {
      checkDeliveryService(userPinCode);
    }
    const dateFormatter = new Intl.DateTimeFormat("en-In", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const minimumDays = new Date(
      Date.now() +
        5.5 * 60 * 60 * 1000 +
        24 * 60 * 60 * 1000 * (findDistrict ? 4 : findState ? 8 : 10)
    );
    let maximumDays = new Date(
      Date.now() +
        5.5 * 60 * 60 * 1000 +
        24 * 60 * 60 * 1000 * (findDistrict ? 5 : findState ? 10 : 14)
    );
    setDeliveryTime(
      <p className={style.delivery}>
        Delivery:{" "}
        <span>{dateFormatter.format(minimumDays).replace("2023", "")}</span>
        To <span>{dateFormatter.format(maximumDays)}</span>
      </p>
    );

    window.addEventListener("popstate", () => {
      router.push("/");
    });
  }, []);
  const { images, iD } = imageSets.find((color) => color.iD === openedColor);
  const [mainImg, setMainImg] = useState();
  useEffect(() => {
    setMainImg(images[0].url);
  }, [images]);
  const discount = ((mrp - current) / mrp) * 100;

  const checkDeliveryFunc = (event) => {
    const value = event.target.value;
    const valueLength = String(value).length;
    if (valueLength === 5 || valueLength === 7) {
      setPinCodeLabel(LabelText);
    }
    if (valueLength === 6) {
      checkDeliveryService(value);
    }
  };
  const addToCart = async () => {
    if (!token) {
      return router.push("/user/sign-up");
    }
    setWait(true);
    let add = await fetch(`/api/admin/user/product/add-to-cart`, {
      method: "PUT",
      body: JSON.stringify({
        token,
        cPN: productName,
        cPiD: openedColor,
        cPvD: vD,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { message, success } = await add.json();
    if (success) {
      setWait(false);
      alert(message);
    } else {
      setWait(false);
      alert(message);
      router.push("/user/login");
    }
  };
  const buyNow = () => {
    if (pinCodeLabel.success) {
      router.push(
        `/admin/user/product/buy?p=${productName}&q=1&i=${openedColor}${
          variantD ? `&v=${vD}` : ""
        }`
      );
    } else {
      if (pinCodeLabel.success === false) {
        router.push("/contact-us");
      } else {
        alert("Enter pinCode of delivery location");
      }
    }
  };
  return (
    <Fragment>
      {wait ? <Wait /> : null}
      <div className={style.imgContainer}>
        {mainImg ? (
          <Image
            className={style.mainImg}
            height={400}
            width={400}
            alt="product image"
            src={mainImg}
          />
        ) : null}

        <div className={style.images}>
          {images.map((img, index) => (
            <div key={index} className={style.imagesCover}>
              <Image
                onClick={() => setMainImg(img.url)}
                height={100}
                width={130}
                alt="product image"
                src={img.url}
              />
            </div>
          ))}
        </div>
      </div>
      <div className={style.variantInfo}>
        <div className={style.price}>
          <p className={style.currentPrice}>
            ₹{current.toLocaleString("en-IN")}
          </p>
          {mrp ? (
            <Fragment>
              <p className={style.mrp}>
                M.R.P: <span>₹{mrp.toLocaleString("en-IN")}</span>
              </p>
              <p className={style.discount}>{discount.toFixed()}% Off</p>
            </Fragment>
          ) : null}
        </div>
        {deliveryTime}
        <div className={style.options}>
          {imageSetD ? (
            <div className={style.colors}>
              {imageSetD}:
              <div className={style.container}>
                {options.map((color, index) => {
                  let { optID } = color;
                  return (
                    <p
                      className={
                        optID === openedColor ? style.selected : style.non
                      }
                      key={index}
                      onClick={() => setOpenColor({ index, optID })}
                    >
                      {optID}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
        <button onClick={addToCart} className={style.addToCart} type="button">
          Add to Cart
        </button>
        <button onClick={buyNow} className={style.buyNow} type="button">
          Buy Now
        </button>
        <div className={style.userPinCode} htmlFor="pinCode">
          <span
            style={{
              display: pinCodeLabel.success !== null ? "unset" : "none",
            }}
          >
            {pinCodeLabel.success ? "Available: " : "Not available: "}
          </span>
          <p>{pinCodeLabel.message}</p>
          <input
            defaultValue={userPinCode}
            placeholder="area pin"
            onChange={checkDeliveryFunc}
            type="number"
            name="pinCode"
            id="pinCode"
          />
        </div>
      </div>
    </Fragment>
  );
};

export default ImageButton;
