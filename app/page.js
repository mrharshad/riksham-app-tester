import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import queryString from "query-string";
import { Fragment } from "react";
import ServerSidePagination from "./Layouts/serverSidePagination";
("./Layouts/serverSidePagination");
export default async function Home({ searchParams }) {
  const { k, page } = searchParams;
  const request = await fetch(
    `${
      process.env.PROTOCOL_AND_HOST
    }/api/product/products?${queryString.stringify({ keyword: k, page })}`,
    // { cache: "no-cache" }
    { next: { revalidate: 21600 } }
  );
  const { products } = await request.json();
  const totalProducts = products?.length;

  return (
    <Fragment>
      <section id="productUser" className={styles.section}>
        {totalProducts > 0 ? (
          <div className={styles.searchProducts}>
            {products.map((product, index) => {
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
              return (
                <Link prefetch={false} key={index} href={`/product/?k=${name}`}>
                  <div className={styles.ratingReviews}>
                    <p className={styles.review}>Sold: {nOfB || 0}</p>

                    <p className={styles.rating}>
                      <span style={{ width: `${rating * 20.2}%` }}>
                        ★ ★ ★ ★ ★
                      </span>
                      ★ ★ ★ ★ ★
                    </p>
                  </div>

                  <p className={styles.name}>{name}</p>
                  <div className={styles.imgCover}>
                    <Image
                      className={styles.img}
                      src={imageSets[0].images[0].url}
                      height={20}
                      width={200}
                      alt="product image"
                    />
                  </div>
                  {current ? (
                    <div className={styles.priceDiv}>
                      <p className={styles.charges}>
                        <span>
                          Shipping: {shipping ? `₹${shipping}` : "free"}
                        </span>
                        <span>
                          Packaging:
                          {packaging ? ` ₹${packaging}` : " free"}
                        </span>
                      </p>

                      <p className={styles.currentPrice}>
                        <span>₹</span>
                        {current.toLocaleString("en-IN")}
                      </p>
                      {mrp ? (
                        <Fragment>
                          <p className={styles.mrp}>
                            M.R.P: ₹<span>{mrp?.toLocaleString("en-IN")}</span>
                          </p>
                          <p className={styles.discount}>
                            {discount.toFixed()}% Off
                          </p>
                        </Fragment>
                      ) : null}
                    </div>
                  ) : (
                    <p>not declared</p>
                  )}
                  <div className={styles.options}>
                    {(imageSets.length > 1 && !imgSetPD) ||
                    (variants.length > 1 && !variantPD) ? (
                      <p className={styles.priceSame}>
                        Price is same for all
                        <span>
                          {!variantPD && variantD ? ` ${variantD} ` : null}{" "}
                        </span>
                        {!variantPD && variantD && !imgSetPD && imageSetD
                          ? "&"
                          : null}
                        <span>
                          {!imgSetPD && imageSetD ? ` ${imageSetD} ` : null}
                        </span>
                        !
                      </p>
                    ) : null}
                    {imageSetD ? (
                      <div className={styles.colors}>
                        <p>{imageSetD}:</p>
                        {imageSets.map((color, index) => {
                          return <span key={index}>{color.iD}</span>;
                        })}
                      </div>
                    ) : null}
                    {variantD ? (
                      <div className={styles.variants}>
                        <p>{variantD}:</p>
                        {variants.map((variant, index) => {
                          return <span key={index}>{variant.vD}</span>;
                        })}
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className={styles.notFound}>Product Not Found</p>
        )}
        {!searchParams.page && totalProducts !== 21 ? null : (
          <ServerSidePagination
            page={page}
            k={k}
            nextPage={totalProducts !== 21 ? false : true}
            url={"/"}
            Link={Link}
            previousPage={page > 1 || false}
          />
        )}
      </section>
    </Fragment>
  );
}
