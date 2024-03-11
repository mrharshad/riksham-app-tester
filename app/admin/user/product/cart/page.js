import React, { Fragment } from "react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import style from "./productCart.module.css";
import RemoveProducts from "./removeProducts";
export const metadata = {
  title: "Cart Product",
};
const ProductCarts = async ({ searchParams }) => {
  let { bs, num } = searchParams;
  num = +num;

  const cookieStore = cookies();
  const token = cookieStore.get(process.env.COOKIE_TOKEN_NAME)?.value;
  if (!token) {
    return redirect("/user/sign-up");
  }

  const validation = cookieStore.get("userInfoRevalidate")?.value;
  const protocol = process.env.PROTOCOL_AND_HOST;
  const user = await fetch(
    `${protocol}/api/admin/user/account?token=${token}&validation=${
      validation || "newData"
    }`,
    // { cache: "no-cache" }
    { next: { revalidate: 21600 } }
  );
  const { success: uSuccess, message: uMessage, data } = await user.json();
  if (uMessage) {
    return redirect("/user/login");
  }
  let { cartPro, state, district, pinCode } = data;
  let allProducts = [];
  const removeProducts = [];
  for (let pro of cartPro) {
    const requestP = await fetch(
      `${protocol}/api/product/single-product/${pro.cPN}`,
      { cache: "no-cache" }
      // { next: { revalidate: 21600 } }
    );
    const { product, success, message } = await requestP.json();
    if (product) {
      allProducts.push(product);
    } else {
      removeProducts.push(pro.cPN);
    }
  }
  async function removeCartPro(names) {
    const removerCart = await fetch(
      `${protocol}/api/admin/user/product/delete-cart`,
      {
        method: "PUT",
        body: JSON.stringify({
          names,
          token,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { success, message } = await removerCart.json();
    if (success) {
      cartPro = cartPro.filter((data) => !removeProducts.includes(data.cPN));
      allProducts = allProducts.filter(
        (data) => !removeProducts.includes(data.name)
      );
    }
  }

  if (removeProducts.length > 0) {
    await removeCartPro();
    removeProducts.length = 0;
  }
  const totalReceivePro = allProducts.length;
  if (totalReceivePro === 0) {
    return <h3 className={style.h3}>Cart empty </h3>;
  }
  const totalCartProducts = cartPro.length;

  let names = [];

  let totalBuyer = 0;

  const districtBuyer = [];
  const stateBuyer = [];
  let buyer = [];
  if (num > totalReceivePro - 1 || num < 0 || !num) num = 0;
  function buyerLocSplit(indexNum) {
    if (removeProducts.length > 0) {
      num = 0;
      allProducts = allProducts.filter(
        (data) => !removeProducts.includes(data.name)
      );
    }
    names.push(...allProducts.map((pro) => pro.name));
    if (totalReceivePro > 0) {
      buyer = allProducts[indexNum]?.buyers;
      totalBuyer = buyer.length;
      function dataPush(data, bD, index) {
        if (bD === district) {
          districtBuyer.push(data);
          buyer[index] = null;
        } else {
          stateBuyer.push(data);
          buyer[index] = null;
        }
      }
      buyer.forEach((data, index) => {
        const { bS, bD } = data;
        if (bS === state) {
          dataPush(data, bD, index);
        }
      });

      buyer = buyer.filter((data) => data !== null);
    } else {
      totalBuyer = 0;
    }
  }

  function specificLoc(loc, text) {
    const copyData =
      loc == "district" ? districtBuyer : loc == "state" ? stateBuyer : buyer;

    if (copyData.length === 0) {
      return;
    }

    return (
      <div>
        <p>{text}</p>
        {copyData.map((data) => {
          const { bN, _id, dDate, bC, bR, bD, bS } = data;
          return (
            <div key={bN}>
              <span>ID: {_id} </span>

              <p className={style.rating}>
                <span
                  style={{
                    width: `${bR * 20}%`,
                    color: bR <= 2 ? "red" : bR < 4 ? "yellow" : "green",
                  }}
                >
                  ★ ★ ★ ★ ★
                </span>
              </p>

              <span className={style.bName}>{bN}</span>
              <span className={style.address}>
                ({`${bD} < `}
                {bS})
              </span>
              <span className={style.delivered}>Delivered: {dDate}</span>
              {bC ? (
                <p className={style.comment}>
                  {bC} Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Voluptas, at vel! Tempora, quam optio ipsum explicabo eius
                  eveniet maiores iure odit velit incidunt natus ab animi qui
                  quo enim quia. Earum, nihil omnis maxime soluta dolorum eos
                  impedit error sed repudiandae dignissimos ut architecto
                  sapiente reprehenderit. Obcaecati laborum quisquam nesciunt
                  quia quas repellat qui commodi dolor culpa adipisci saepe
                  officiis nihil possimus quis, voluptatibus voluptatum! Facere
                  pariatur distinctio modi omnis est sapiente repellat placeat
                  ea beatae dolore natus, quaerat numquam saepe adipisci?
                  Quaerat perferendis consequatur assumenda error repellendus
                  officiis, tenetur cumque eaque minima deleniti porro veniam,
                  magnam voluptates. Animi, repellat commodi. Rerum
                  reprehenderit dolorem at, veniam amet incidunt maiores ab
                  recusandae debitis voluptatibus dolore, minima nostrum
                  aspernatur perferendis eum est. Fuga ex laboriosam non
                  consequuntur beatae repellat aliquid perspiciatis temporibus?
                  Alias blanditiis culpa nobis debitis harum amet adipisci quod
                  tempora praesentium repudiandae rerum rem veniam et quis
                  libero, laudantium iusto eius reiciendis unde minima
                  inventore! Quos, inventore? Voluptatum nobis voluptatibus sit
                  doloremque ab omnis laudantium maiores, nemo cupiditate
                  praesentium distinctio veniam tenetur rerum, consequatur
                  voluptate debitis blanditiis ea. Quo blanditiis harum mollitia
                  sint vitae enim voluptates voluptas eos reprehenderit
                  obcaecati, rerum ea eveniet libero voluptatibus magnam, id
                  optio in odio.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Fragment>
      <section id="productUser" className={style.section}>
        {totalCartProducts > 0 ? (
          <RemoveProducts Fragment={Fragment} token={token} products={names} />
        ) : null}
        <div className={style.productsContainer}>
          <div className={style.cartProducts}>
            {allProducts.map((pro, index) => {
              const {
                imageSets,
                rating,
                nOfB,
                packaging,
                shipping,
                variantD,
                imageSetD,
                variantPD,
                imgSetPD,
                name,
                variants,
              } = pro;
              try {
                const { cPiD, cPAddAt, cPvD } = cartPro[index];

                const findVariant = cPvD
                  ? variants.find((variant) => variant.vD === cPvD)
                  : variants[0];
                const findOpt = findVariant.options.find(
                  (opt) => opt.optID === cPiD
                );
                const { current, mrp } = findOpt;

                const image = imageSets.find((img) => img.iD === cPiD).images[0]
                  .url;
                const discount = ((mrp - current) / mrp) * 100;

                return (
                  <div
                    style={{
                      boxShadow: `0 0 5px 0px ${
                        index === num ? "skyblue" : "white"
                      }`,
                    }}
                    key={index}
                    className={style.cartPro}
                  >
                    <div className={style.ratingReviews}>
                      <p className={style.review}>Sold: {nOfB || 0}</p>

                      <p className={style.rating}>
                        <span
                          style={{
                            width: `${rating * 20.2}%`,
                          }}
                        >
                          ★ ★ ★ ★ ★
                        </span>
                        ★ ★ ★ ★ ★
                      </p>
                    </div>

                    <p className={style.name}>
                      {name}{" "}
                      {variantD || imageSetD ? (
                        <span>
                          ( {variantD ? `${cPvD} > ` : null}
                          {imageSetD ? cPiD : null} )
                        </span>
                      ) : null}
                    </p>
                    <Link className={style.imgCover} href={`?num=${index}`}>
                      <Image
                        className={style.img}
                        src={image}
                        height={20}
                        width={200}
                        alt="product image"
                      />
                    </Link>
                    <div className={style.priceDiv}>
                      <p>Shipping:{shipping ? ` ₹${shipping}` : " free"}</p>
                      <p>Packaging:{packaging ? ` ₹${packaging}` : " free"}</p>
                      <p className={style.currentPrice}>
                        ₹{current.toLocaleString("en-IN")}
                      </p>
                      {mrp ? (
                        <Fragment>
                          <p className={style.mrp}>
                            M.R.P: ₹<span>{mrp.toLocaleString("en-IN")}</span>
                          </p>
                          <p className={style.discount}>
                            {discount.toFixed()}% Off
                          </p>
                        </Fragment>
                      ) : null}
                    </div>

                    <Link
                      className={style.buyNow}
                      prefetch={false}
                      href={`/product?k=${name}`}
                    >
                      Buy now
                    </Link>
                    <p className={style.added}>{cPAddAt}</p>
                  </div>
                );
              } catch (err) {
                removeProducts.push(name);
                num = 0;
                return null;
              }
            })}
          </div>
        </div>
        {(function () {
          const totalRemover = removeProducts.length;
          if (totalRemover > 0) removeCartPro(removeProducts);
          if (totalRemover === totalReceivePro)
            redirect("/admin/user/product/cart?num=0");
        })()}
        {buyerLocSplit(num)}
        <input
          type="checkbox"
          className={style.toggleBtn}
          name="show"
          id="show"
        />
        {totalBuyer > 0 ? (
          <label className={style.seeMore} htmlFor="show">
            See buyers
          </label>
        ) : null}
        {totalBuyer > 0 ? (
          <div className={style.buyersContainer}>
            <label className={style.seeMore} htmlFor="show">
              <span className={style.first}></span>
              <span className={style.second}></span>
            </label>
            <p>Buyers nearest to you</p>
            {specificLoc("district", `your district buyers`)}
            {specificLoc("state", `your state buyers`)}
            {specificLoc("", "global buyers")}
          </div>
        ) : (
          <p>Product has not been delivered to anyone yet</p>
        )}
      </section>
    </Fragment>
  );
};

export default ProductCarts;
