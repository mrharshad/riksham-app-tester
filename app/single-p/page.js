import React, { Fragment } from "react";
import style from "./product.module.css";
import { notFound } from "next/navigation";
import Link from "next/link";
import ButtonsComponent from "./ButtonsComponent";

const SingleProduct = async ({ params, searchParams }) => {
  const { k, _id } = searchParams;
  let result;
  async function dataFetch(protocol_and_host) {
    const request = await fetch(
      `${protocol_and_host}/api/product/single-p/${_id}`,
      { cache: "no-cache" }
      // { next: { revalidate: 21600 } }
    );
    result = (await request.json()).data;
  }
  try {
    await dataFetch(process.env.PROTOCOL_AND_HOST);
  } catch (err) {
    await dataFetch(process.env.Second_Host_Name);
  }
  if (!result) {
    notFound();
  }
  const {
    name,
    rating,
    nOfB,
    rInP,
    buyers,
    tOfP,
    payType,
    description,
    imgSetPD,
    imageSetD,
    keyValueD,
    aInfo,
    certificate,
    tOfDelivery,
    des1,
    des2,
    des3,
    ...clientData
  } = result;
  console.log("tOfP", tOfP);
  const [one, two, three, four, five] = rInP;

  const keyValueElement = (data) => {
    const element = [];
    const loop = data.length;
    for (let key = 0; key < loop; ) {
      element.push(
        <div className={style.keyValue} key={key}>
          <p className={style.key}>{data[key]}</p>
          <p className={style.value}>{data[key + 1]}</p>
        </div>
      );
      key = key + 2;
    }
    return element;
  };

  return (
    <Fragment>
      <section id="productUser" className={style.section}>
        <h1>{name}</h1>
        <div className={style.firstDiv}>
          <div className={style.ratingReviews}>
            <p className={style.review}>Sold: {nOfB || 0}</p>
            <p className={style.rating}>
              ★ ★ ★ ★ ★
              <span style={{ width: `${rating * 20.2}%` }}>★ ★ ★ ★ ★</span>
            </p>
          </div>
          {!imgSetPD && imageSetD ? (
            <p className={style.priceSame}>
              {" "}
              Price of all
              <span> {imageSetD}</span> is same
            </p>
          ) : (
            <p className={style.priceSame}>
              <span>Free Delivery </span> &{des1}
            </p>
          )}
        </div>
        <ButtonsComponent
          imageSetD={imageSetD}
          tOfP={tOfP}
          Link={Link}
          clientData={clientData}
        />

        <div className={style.productInfo}>
          <p className={style.productInfoText}>Product Information</p>

          {keyValueElement(keyValueD)}

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
          <div className={style.additionDiv}>{keyValueElement(aInfo)}</div>
        </div>
        <div className={style.reviewContainer}>
          <h5 className={style.reviewsHeading}>
            Reviews from people who have bought
          </h5>
          <span className={style.writeReviews}>
            Only those who have bought the product can write:-
            <Link replace href={`/admin/user/product/review?_id=${_id}`}>
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
