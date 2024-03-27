"use client";
import React, { Fragment, memo, useEffect, useMemo, useState } from "react";
import style from "./buttons.module.css";
import { useRouter } from "next/navigation";
import { Wait } from "../Layouts/toastAndWait";
import { pageKeyChange, visitPage } from "../redux/slice/pageHistory";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
function ButtonsComponent({ clientData, tOfP, imageSetD, Link }) {
  const {
    _id,
    variantD,
    imageSets,
    productName,
    variants,
    varKVD = {},
    thumbnail,
    category,
  } = clientData;
  const { data, uSos, device } = useSelector((data) => data.user);
  const { fName, location } = data || {};
  const { singleP = {}, active } = useSelector((data) => data.pageHistory);
  const {
    scrolled,
    proId,
    tOfPData = [],
    cateData = [],
    fetchKey,
    cateName,
    tOfPName,
  } = singleP;
  const dispatch = useDispatch();
  const router = useRouter();
  const [openedVar, setOpenedVar] = useState(0);
  const [openedOpt, setOpenedOpt] = useState(0);

  const [wait, setWait] = useState();

  const [pinCodeInfo, setPinCodeInfo] = useState({
    district: "",
    state: "",
    pinCode: "",
  });
  console.log("varKVD", varKVD);
  const {
    mrp,
    optID,
    loc,
    kVD,
    dis,
    min,
    variantNames,
    optionNames,
    images,
    iSN,
    disOpt,
    stockInfo,
  } = useMemo(() => {
    let stockInfo = {
      message: "Find out the maximum time it can take for delivery",
      stock: (
        <p style={{ color: "green" }} className={style.stock}>
          In-Stock
        </p>
      ),
    };

    const { vD, disOpt, options } = variants[openedVar];
    const optionNames = options.map(({ optID }) => optID);
    const { loc, ...optData } = options[openedOpt];
    console.log("disOpt", disOpt);
    let state = 0;
    let district = 0;
    let global = 0;

    loc.forEach((sta) => {
      const { s, d } = sta;
      const stateQty = d.reduce((acc, dis) => {
        const [name, qty] = dis.split(":");
        if (pinCodeInfo.district == name) district = +qty;
        return acc + +qty;
      }, 0);
      if (pinCodeInfo.state === s) state = stateQty;

      global += stateQty;
    });

    const dateFormatter = new Intl.DateTimeFormat("en-In", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const { min, dis } = disOpt[0] || {};

    const oneDay = 5.5 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000;
    const minimumDays = new Date(
      Date.now() + oneDay * (district >= min ? 4 : state >= min ? 8 : 10)
    );
    let maximumDays = new Date(
      Date.now() + oneDay * (district >= min ? 5 : state >= min ? 10 : 14)
    );
    if (min > global)
      stockInfo.stock = <p className={style.stock}>Out Of Stock</p>;
    if (min < global && min * 6 > global)
      stockInfo.lowStock = (
        <p className={style.lowStock}>
          Only {global} {tOfP} left
        </p>
      );

    if (pinCodeInfo.pinCode.length !== 6)
      stockInfo.message = (
        <p className={style.delivery}>
          Delivered:{" "}
          <span>
            {dateFormatter
              .format(minimumDays)
              .replace(new Date().getFullYear(), "")}
          </span>
          To <span>{dateFormatter.format(maximumDays)}</span>
        </p>
      );
    const kVD = new Array();
    const data = varKVD[vD];
    const loop = data?.length;
    for (let key = 0; key < loop; ) {
      kVD.push(
        <div key={key}>
          <p>{data[key]}</p>
          <span>{data[key + 1]}</span>
        </div>
      );
      key = key + 2;
    }

    return {
      vD,
      stockInfo,
      optionNames,
      disOpt: disOpt.slice(1),
      kVD,
      min,
      dis,
      ...optData,
      ...imageSets.find((set) => set.iSN === optionNames[openedOpt]),
      variantNames: variants.map((obj) => obj.vD),
    };
  }, [openedOpt, openedVar, pinCodeInfo]);
  console.log("kVD", kVD);
  const [mainImg, setMainImg] = useState();

  useEffect(() => {
    setMainImg(images[0].url);
  }, [images]);

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
  const pinCodeChange = (event) => {
    const pinCode = String(event.target.value);
    const valueLength = pinCode.length;
    if (valueLength > 4 || valueLength < 8) {
      setPinCodeInfo(Object.assign(pinCodeInfo, { pinCode }));
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
  const newProduct = (obj = {}) => {
    console.log("type of product", tOfP, proId, _id);
    if (proId == _id) {
      dispatch(visitPage({ active: "singleP" }));
    } else {
      console.log("set data else condition");
      dispatch(
        visitPage({
          name: "singleP",
          value: {
            proId: _id,
            cateName: category,
            scrolled: 0,
            ...obj,
          },
          active: "singleP",
        })
      );
    }
  };
  useEffect(() => {
    const { scrollTo } = window;
    scrollTo({
      top: scrolled || 0,
      left: 0,
      behavior: "smooth",
    });
    const display = device == "Desktop" ? "flex" : "grid";
    document.getElementById("tOfP").style.display = display;
    document.getElementById("category").style.display = display;
    console.log("type chnage hone vala useEffect", fetchKey, tOfP);
    const query = {
      tOfPPage: 1,
      tOfPData: [],
      tOfPName: tOfP,
    };
    if (cateName !== category) {
      query.catePage = 1;
      query.cateData = [];
    }
    if (!proId) {
      query.fetchKey = "tOfP";
      query.fetchNow = Math.floor(Math.random() * 1000);
    }
    if (tOfPName && tOfPName === tOfP) {
      newProduct();
    } else {
      newProduct(query);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            dispatch(
              visitPage({
                name: "singleP",
                value: {
                  fetchKey: entry.target.id,
                  fetchNow: Math.floor(Math.random() * 1000),
                },
              })
            );
          }
        });
      },
      {
        // root: document.querySelector("nav"),
        // rootMargin: "100px",
        // threshold: 0,
      }
    );
    const tOfPElement = document.querySelector(`#tOfP`);
    const categoryElement = document.querySelector("#category");
    observer.observe(tOfPElement);
    observer.observe(categoryElement);

    return () => {
      observer.disconnect();
      dispatch(visitPage({ active: "other" }));
    };
  }, [_id]);
  const convertedURL = (text) => {
    return text.replace(/ /g, "-");
    // .replace(/[^\w-]+/g, "");
  };
  const product = ({
    _id,
    name,
    des1,
    des2,
    des3,
    rating,
    nOfB,
    imageSetD,
    imgSetPD,
    variants,
    thumbnail,
  }) => {
    const { options, disOpt } = variants[0];
    const dis = disOpt[0].dis;
    const mrp = options[0].mrp;
    return (
      <Link
        className={style.single}
        prefetch={false}
        key={_id}
        href={`/single-p/?_id=${_id}&k=${convertedURL(name)}`}
      >
        <div className={style.ratingReviews}>
          <p className={style.review}>Sold: {nOfB || 0}</p>

          <p className={style.rating}>
            <span style={{ width: `${rating * 20.2}%` }}>★ ★ ★ ★ ★</span>★ ★ ★ ★
            ★
          </p>
        </div>

        <p className={style.name}>{name}</p>
        <div className={style.imgCover}>
          <Image
            className={style.img}
            src={thumbnail.thumbUrl}
            height={20}
            width={200}
            alt="product image"
          />
        </div>

        <div className={style.priceDiv}>
          <p className={style.charges}>
            Free <span>Shipping</span>
          </p>

          <p className={style.currentPrice}>
            <span>₹</span>
            {(dis ? (mrp - mrp * (dis / 100)).toFixed() : mrp).toLocaleString(
              "en-IN"
            )}
          </p>
          {dis > 0 && (
            <>
              <p className={style.mrp}>
                M.R.P: ₹<span>{mrp.toLocaleString("en-IN")}</span>
              </p>
              <p className={style.discount}>{dis}% Off</p>
            </>
          )}
        </div>
        <div className={style.descriptions}>
          {!imgSetPD && imageSetD ? (
            <p className={style.priceSame}>
              Price of all
              <span> {imageSetD}</span> is same
            </p>
          ) : (
            <p>{des1}</p>
          )}
          <p>{des2}</p>
          <p>{des3}</p>
        </div>
      </Link>
    );
  };

  return (
    <Fragment>
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
      <div className={style.thirdDiv}>
        <button onClick={() => {}} className={style.addToCart} type="button">
          Add to Cart
        </button>
        <p className={style.free}>Free Delivery</p>
        <div className={style.pinCode}>
          {stockInfo.message}
          <input type="number" name="pinCode" id="pinCode" />
        </div>
      </div>
      <div id={style.similarPro} className={style.products}>
        {tOfPData.length > 0 && <p> Similar Products</p>}
        <div>
          {tOfPData.map(product)}
          <div id="tOfP" className={style.single}>
            <div className={style.ratingReviews}></div>
            <p className={style.name}></p>
            <div className={style.imgCover}></div>

            <div className={style.descriptions}>
              <p></p>
              <p></p>
              <p></p>
            </div>
          </div>
        </div>
      </div>

      <div id={style.relatedPro} className={style.products}>
        {cateData.length > 0 && <p> Related Product</p>}
        <div>
          {cateData.map(product)}
          <div id="category" className={style.single}>
            <div className={style.ratingReviews}></div>
            <p className={style.name}></p>
            <div className={style.imgCover}></div>

            <div className={style.descriptions}>
              <p></p>
              <p></p>
              <p></p>
            </div>
          </div>
        </div>
      </div>

      <div className={style.secondDiv}>
        <div>
          {stockInfo.stock} {stockInfo.lowStock}
        </div>
        <div className={style.price}>
          <p className={style.current}>
            <span> ₹</span>
            {dis ? (mrp - mrp * (dis / 100)).toFixed() : mrp}
          </p>
          {dis ? (
            <>
              <p className={style.discount}>-{dis}%</p>
              <p className={style.mrp}>
                M.R.P: <span>₹{mrp}</span>
              </p>
            </>
          ) : null}
        </div>

        {min > 1 && <p>Orders less than {min} pieces will not be accepted</p>}
        <div className={style.allOptions}>
          {variantD && (
            <div className={style.options}>
              <p>{variantD}</p>
              <div>
                {variantNames.map((opt, index) => (
                  <span
                    style={
                      index === openedVar
                        ? {
                            backgroundColor: "white",
                            border: "1px solid",
                          }
                        : null
                    }
                    key={index}
                    onClick={() => {
                      const optLength = variants[index].options.length;
                      if (optLength < openedOpt + 1) {
                        setOpenedOpt(optLength - 1);
                      }
                      setOpenedVar(index);
                    }}
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {imageSetD && (
            <div className={style.options}>
              <p>{imageSetD}</p>
              {optionNames.map((opt, index) => (
                <span
                  style={
                    index === openedOpt
                      ? {
                          backgroundColor: "white",
                          border: "1px solid",
                        }
                      : null
                  }
                  key={index}
                  onClick={() => setOpenedOpt(index)}
                >
                  {opt}
                </span>
              ))}
            </div>
          )}
          {disOpt && (
            <div id={style.discounts} className={style.options}>
              <p>Quantity Discount</p>
              <div>
                {disOpt.map(({ min, dis }, index) => (
                  <span key={index}>
                    {" "}
                    {min} : -{dis}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={style.kVD}>
          <p>Different from others</p>
        </div>
      </div>
    </Fragment>
  );
}
export default ButtonsComponent;
