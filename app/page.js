"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchKeyProduct, fetchRandom } from "./redux/slice/activity";
import { newPage, pageKeyChange, position } from "./redux/slice/pageHistory";

// import ServerSidePagination from "./Layouts/serverSidePagination";
// import dynamic from "next/dynamic";
// const HomePageDynamic = dynamic(() => import("./home-page-dynamic"), {
//   ssr: false,
//   loading: () => <p>Loading...</p>,
// });

export default function Home({ searchParams }) {
  const dispatch = useDispatch();
  console.log("home page render");
  const [skeleton, setSkeleton] = useState([]);

  const { home, singlePro, scrollFetching, current } = useSelector(
    (data) => data.pageHistory
  );
  const { scrolled } = home || {};

  const { data, device, token } = useSelector((data) => data.user);
  const { intTofP, products, loadingA, searchPro, searchSort, search, page } =
    useSelector((data) => data.activity);

  const totalSearchPro = searchPro.length;
  const isMobile = device === "Mobile";

  const { keyName, keyPage, type } = search;

  const fetchRandomData = () => {
    dispatch(
      fetchRandom({
        page,
        intTofP,
      })
    );
  };

  useEffect(() => {
    if (current === "home" && !keyName && page && !totalSearchPro) {
      fetchRandomData();
    }
  }, [scrollFetching]);

  useEffect(() => {
    if (
      page &&
      ((keyName && keyPage && current === "home") ||
        (keyName && keyPage && !totalSearchPro))
    ) {
      dispatch(
        fetchKeyProduct({
          keyName,
          keyPage,
          searchSort,
          type,
        })
      );
    }
  }, [scrollFetching, keyName, searchSort]);

  useEffect(() => {
    const { scrollTo } = window;
    if (scrolled >= 0) {
      console.log("scrolled >= 0", scrolled);
      scrollTo({
        top: scrolled,
        left: 0,
        behavior: "smooth",
      });
    } else {
      dispatch(newPage("home"));
      console.log("run run 1", home);
      if (!keyName) {
        fetchRandomData();
      }
    }
    dispatch(pageKeyChange({ name: "current", value: "home" }));
    // setFirst(true);
    // const scrollHandler = () => {
    //   dispatch(
    //     position({
    //       name: "home",
    //       current: window.scrollY,
    //     })
    //   );
    // };

    // addEventListener("scroll", scrollHandler);

    const demo = [];
    let loop = !isMobile ? 28 : 5;
    for (let i = 0; i < loop; i++) {
      demo.push(i);
    }
    setSkeleton(demo);
    // const observer = new IntersectionObserver(
    //   (entries) => {
    //     entries.forEach((entry) => {
    //       if (entry.isIntersecting) {
    //         setScrollFetching(Math.floor(Math.random() * 1000));
    //       }
    //     });
    //   },
    //   {
    //     // root: document.querySelector("nav"),
    //     // rootMargin: "100px",
    //     // threshold: 0,
    //   }
    // );

    // const items = document.querySelector(`#loading`);
    // console.log("run run 2", items);
    // observer.observe(items);
    // dispatch(pageKeyChange({ name: "current", value: "home" }));

    return () => {
      // observer.disconnect();
      // removeEventListener("scroll", scrollHandler);
      dispatch(pageKeyChange({ name: "current", value: "other" }));
    };
  }, []);

  return (
    <Fragment>
      <section id="productUser" className={styles.section}>
        {loadingA == "key-pro" || loadingA == "random-pro" ? (
          <div id={styles.skeletonDiv} className={styles.searchProducts}>
            {skeleton.map((data, i) => {
              return (
                <div id={styles.skeleton} key={i} className={styles.single}>
                  <div className={styles.ratingReviews}></div>
                  <p className={styles.name}></p>
                  <div className={styles.imgCover}></div>

                  <div className={styles.options}>
                    <p></p>
                    <p></p>
                    <p></p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
        <div className={styles.searchProducts}>
          {(keyName || totalSearchPro ? searchPro : products).map(
            (product, index) => {
              const {
                _id,
                name,
                imageSets,
                dis1,
                dis2,
                dis3,
                rating,
                nOfB,
                variantD,
                variantPD,
                imageSetD,
                imgSetPD,
                variants,
                thumbnail,
              } = product;
              const { options } = variants[0];
              const { current, mrp } = options[0];
              const discount = ((mrp - current) / mrp) * 100;
              return (
                <Link
                  className={styles.single}
                  prefetch={false}
                  key={_id}
                  href={`/product/?k=${name}`}
                >
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
                      src={thumbnail.thumbUrl}
                      height={20}
                      width={200}
                      alt="product image"
                    />
                  </div>

                  <div className={styles.priceDiv}>
                    <p className={styles.charges}>
                      <span>Free Shipping</span>
                      <span>Free Packaging</span>
                    </p>

                    <p className={styles.currentPrice}>
                      <span>₹</span>
                      {current?.toLocaleString("en-IN")}
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
                    ) : (
                      <p>This is first description</p>
                    )}
                    <p>This is second description</p>
                    <p>This is third description</p>
                  </div>
                </Link>
              );
            }
          )}
          {!totalSearchPro && keyName ? (
            <p className={styles.notFound}>Product Not Found</p>
          ) : null}
        </div>
        <div id="loading" className={styles.loading}></div>
      </section>
    </Fragment>
  );
}
