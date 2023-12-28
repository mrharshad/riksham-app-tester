import React, { Fragment } from "react";
import style from "./product.module.css";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import ImageButton from "./imageButton";

const SingleProduct = async ({ params, searchParams }) => {
  const token = cookies().get(process.env.COOKIE_TOKEN_NAME)?.value;
  let userInfo = cookies().get("userInfo")?.value;
  if (userInfo) {
    userInfo = JSON.parse(userInfo);
  }
  const { k, page, v } = searchParams;
  const request = await fetch(
    `${process.env.PROTOCOL_AND_HOST}/api/product/single-product/${k}`,
    { cache: "no-cache" }
    // { next: { revalidate: 21600 } }
  );
  const result = await request.json();

  const { success, product } = result;

  const {
    _id,
    name: singleName,
    imageSets,
    rating,
    nOfB,
    rInP,
    buyers,
    category,
    tOfP,
    payType,
    description,
    variantD,
    variantPD,
    imgSetPD,
    imageSetD,
    variants,
    shipping,
    packaging,
    everyPC,
    keyValueD,
    aInfo,
  } = product || {};

  if (!_id) {
    notFound();
  }
  async function findMore(apiUrl, key) {
    const requestType = await fetch(
      `${
        process.env.PROTOCOL_AND_HOST
      }/api/product/${apiUrl}?key=${key}&page=${1}`,
      { cache: "no-cache" }
      // { next: { revalidate: 21600 } }
    );

    const { success, products } = await requestType.json();
    return products;
  }

  let typePro = await findMore("type", tOfP);
  let countProducts = typePro.length;

  let categoryPro;
  if (countProducts === 1) {
    typePro = false;
    categoryPro = await findMore("category", category);
    countProducts = categoryPro.length;
  }

  const [one, two, three, four, five] = rInP;
  const {
    options,
    varKVD,
    vD: vD1,
  } = variants.find((variant) => variant.vD === v) || variants[0];
  keyValueD.push(...varKVD); // iss code me hum keyValueD array me varKVD array ke sabhi value ko push kr rahe hai concat ke bhi istemal kr sakte the
  return (
    <Fragment>
      <section id="productUser" className={style.section}>
        <div className={style.product}>
          <h1 className={style.name}>{singleName}</h1>

          <div className={style.variantMain}>
            <div className={style.exInfo}>
              <div className={style.ratingReviews}>
                <p className={style.review}>Sold: {nOfB || 0}</p>
                <p className={style.rating}>
                  ★ ★ ★ ★ ★
                  <span style={{ width: `${rating * 20.2}%` }}>★ ★ ★ ★ ★</span>
                </p>
              </div>

              <p className={style.charges}>
                <span>Shipping: {shipping ? `₹${shipping}` : "Free"}</span>
                <span>
                  Packaging:
                  {packaging ? ` ₹${packaging}` : " Free"}
                </span>
              </p>
              {variantD ? (
                <div className={style.variants}>
                  <p>{variantD}:</p>
                  <div className={style.container}>
                    {variants.map((vnt, index) => {
                      const { vD } = vnt;
                      return (
                        <Link
                          style={vD1 === vD ? { background: "White" } : null}
                          key={index}
                          href={`/product?k=${k}&v=${vD}`}
                        >
                          {vD}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {!imgSetPD || !variantPD ? (
                <p className={style.priceSame}>
                  Price is same for all
                  <span>{!variantPD && variantD ? ` ${variantD} ` : null}</span>
                  {!variantPD && variantD && !imgSetPD && imageSetD
                    ? "&"
                    : null}
                  <span>{!imgSetPD ? ` ${imageSetD} ` : null}</span>!
                </p>
              ) : null}
            </div>

            <ImageButton
              variants={variants}
              Fragment={Fragment}
              token={token}
              userInfo={userInfo}
              options={options}
              vD={vD1}
              imageSets={imageSets}
              imageSetD={imageSetD}
              productName={k}
              Image={Image}
              variantD={variantD}
            />
          </div>
          <div className={style.productInfo}>
            <p className={style.shippingConst}>
              {!shipping && !packaging
                ? "You can order any quantity, no charge"
                : shipping || (packaging && everyPC)
                ? "The higher the order quantity, the higher the fee"
                : "Regardless of the quantity of order, there will be no increase in the fee"}
            </p>
            <p className={style.payment}>
              Cash on Delivery / Pay on Delivery
              <span>
                -{" "}
                {!payType.includes("Cash on Delivery / Pay on Delivery")
                  ? "-Not"
                  : ""}{" "}
                Available
              </span>
            </p>
            <p className={style.productInfoText}>Product Information</p>
            {keyValueD.map((data, index) => (
              <div id={style.keyValue} key={index}>
                <p className={style.key}>{data[0]}</p>
                <p className={style.value}>{data[1]}</p>
              </div>
            ))}
            <div className={style.description}>
              {description.map((data, index) => (
                <p className={style.nonKey} key={index}>
                  {data}
                </p>
              ))}
            </div>
            <input
              type="checkbox"
              name="additionInfo"
              id="additionInfo"
              className={style.additionButton}
            />
            <label className={style.additionLabel} htmlFor="additionInfo">
              Addition Information
            </label>
            <div className={style.additionDiv}>
              {aInfo.map((data, index) => (
                <div id={style.keyValue} className={style.keyValue} key={index}>
                  <p className={style.key}>{data[0]}</p>
                  <p className={style.value}>{data[1]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={style.relatedProducts}>
          <p className={style.typeOfProduct}>
            {typePro
              ? `There is more ${tOfP}s`
              : categoryPro && countProducts > 1
              ? `${category}: related products`
              : null}
          </p>
          {(typePro || categoryPro).map((product, index) => {
            const {
              name,
              imageSets,
              rating,
              nOfB,
              packaging,
              shipping,
              variantD,
              imageSetD,
              variantPD,
              imgSetPD,
              variants,
            } = product;
            const { options } = variants[0];
            const { current, mrp } = options[0];
            const discount = ((mrp - current) / mrp) * 100;
            const { images } = imageSets[0];

            return name !== singleName ? (
              <Link prefetch={false} key={index} href={`/product/?k=${name}`}>
                <div className={style.ratingReviews}>
                  <p className={style.review}>Sold: {nOfB}</p>

                  <p className={style.rating}>
                    ★ ★ ★ ★ ★
                    <span style={{ width: `${rating * 20}%` }}>★ ★ ★ ★ ★</span>
                  </p>
                </div>

                <p className={style.name}>{name}</p>
                <div className={style.imgCover}>
                  <Image
                    className={style.img}
                    src={images[0].url}
                    height={20}
                    width={200}
                    alt="product image"
                  />
                </div>
                {current ? (
                  <div className={style.priceDiv}>
                    <p className={style.charges}>
                      <span>
                        Shipping: {shipping ? `₹${shipping}` : "Free"}
                      </span>
                      <span>
                        Packaging:
                        {packaging ? `₹${packaging}` : " Free"}
                      </span>
                    </p>

                    <p className={style.currentPrice}>
                      <span>₹</span>
                      {current.toLocaleString("en-IN")}
                    </p>
                    {mrp ? (
                      <Fragment>
                        <p className={style.mrp}>
                          M.R.P: ₹<span>{mrp?.toLocaleString("en-IN")}</span>
                        </p>
                        <p className={style.discount}>
                          {discount.toFixed()}% Off
                        </p>
                      </Fragment>
                    ) : null}
                  </div>
                ) : (
                  <p>not declared</p>
                )}
                <div className={style.options}>
                  {(imageSets.length > 1 && !imgSetPD) ||
                  (variants.length > 1 && !variantPD) ? (
                    <p className={style.priceSame}>
                      You can choose any
                      <span>
                        {!variantPD && variantD ? ` ${variantD} ` : null}
                      </span>
                      <span>
                        {!imgSetPD && imageSetD ? `  ${imageSetD} ` : null}
                      </span>
                      at this price
                    </p>
                  ) : null}
                  {imageSetD ? (
                    <div className={style.colors}>
                      {imageSetD}:{" "}
                      {imageSets.map((color, index) => {
                        return <span key={index}>{color.iD}</span>;
                      })}
                    </div>
                  ) : null}
                  {variantD ? (
                    <div className={style.variants}>
                      {variantD}:
                      {variants.map((variant, index) => {
                        return <span key={index}>{variant.vD}</span>;
                      })}
                    </div>
                  ) : null}
                </div>
              </Link>
            ) : null;
          })}
        </div>
        <div className={style.reviewContainer}>
          <h5 className={style.reviewsHeading}>
            Reviews from people who have bought
          </h5>
          <span className={style.writeReviews}>
            Only those who have bought the product can write:-
            <Link
              href={`/admin/user/product/review?k=${singleName}&img=${imageSets[0].images[0].url}&p=${_id}`}
            >
              Write a product review
            </Link>
          </span>
          {nOfB > 0 ? (
            <div className={style.ratingInPercent}>
              <span
                style={{
                  color: rating > 3.9 ? "green" : rating > 2.5 ? "gold" : "red",
                }}
              >
                {rating} ★
              </span>
              <p>
                5 Star{" "}
                <span
                  style={{
                    boxShadow: `inset ${five * 1.2}px 0px 0px 0px green`,
                  }}
                ></span>{" "}
                {five}%
              </p>
              <p>
                4 Star{" "}
                <span
                  style={{
                    boxShadow: `inset ${four * 1.2}px 0px 0px 0px green`,
                  }}
                ></span>{" "}
                {four}%
              </p>
              <p>
                3 Star{" "}
                <span
                  style={{
                    boxShadow: `inset ${three * 1.2}px 0px 0px 0px green`,
                  }}
                ></span>{" "}
                {three}%
              </p>
              <p>
                2 Star{" "}
                <span
                  style={{
                    boxShadow: `inset ${two * 1.2}px 0px 0px 0px green`,
                  }}
                ></span>{" "}
                {two}%
              </p>
              <p>
                1 Star{" "}
                <span
                  style={{
                    boxShadow: `inset ${one * 1.2}px 0px 0px 0px green`,
                  }}
                ></span>{" "}
                {one}%
              </p>
            </div>
          ) : (
            <p className={style.noReviews}>No Reviews</p>
          )}
          <div className={style.reviews}>
            {buyers.map((review, index) => {
              const { bN, bR, bP, bD, bS, bC, dDate } = review;
              return (
                <div key={index} className={style.review}>
                  <p className={style.name}>{bN}</p>
                  <p className={style.star}>
                    <span
                      style={{
                        width: `${bR * 20}%`,
                        color: bR ? "gold" : "gray",
                      }}
                    >
                      ★ ★ ★ ★ ★
                    </span>
                  </p>
                  <p className={style.reviewCreated}>{dDate}</p>
                  <p className={style.comment}>
                    {" "}
                    ({`${bD} <`} {bS}) : {bC ? bC : null}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Fragment>
  );
};

export default SingleProduct;
