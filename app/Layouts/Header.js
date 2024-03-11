"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import style from "./Header.module.css";
import { useDispatch, useSelector } from "react-redux";
import { commonUser } from "../redux/slice/user";
import {
  commonActivity,
  searchProduct,
  searchKeyChange,
  intTofPFunc,
  activityKey,
  searchSortChange,
  removeSearchKeys,
} from "../redux/slice/activity";
import {
  clearSearch,
  fetchSearchKeys,
  pageKeyChange,
  position,
} from "../redux/slice/pageHistory";
import { UserAlert } from "./toastAndWait";

const Header = ({ Link, Image, userData = {}, connect }) => {
  const router = useRouter();

  let {
    searchKeys: oldSearchKeys,
    intTofP: oldIntOfP,
    token: oldToken,
    ...oldData
  } = userData;
  const dispatch = useDispatch();
  const keyword = useRef();

  let {
    current,
    loading,
    filteredSearch,
    nameKeys,
    tOfPKeys,
    suggestion,
    searches,
    pSOS,
  } = useSelector((data) => data.pageHistory);

  const { intTofP, search, searchKeys, searchSort, aSOS, loadingA } =
    useSelector((data) => data.activity);
  const { data, token, connectIn, numOfNewOrder, numOfCartP } = useSelector(
    (data) => data.user
  );
  const { fName } = data || {};

  let numOfFiltered = filteredSearch.length;
  function capitalizeWords(str) {
    const final = str || keyword.current.value.trim().toLowerCase();
    return final.replace(/\b\w/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  const inputChange = () => {
    if (!loading) {
      dispatch(pageKeyChange({ name: "loading", value: true }));
      setTimeout(() => {
        dispatch(pageKeyChange({ name: "loading", value: false }));
      }, 1500);
    }
  };
  const changeSort = (newSort) => {
    if (searchSort !== newSort) {
      searchFunc(undefined, newSort);
    }
  };

  useEffect(() => {
    if (oldToken) {
      try {
        oldSearchKeys = oldSearchKeys.map((keyObj) => JSON.parse(keyObj));
      } catch (err) {}
    }

    dispatch(commonActivity({ oldIntOfP, oldSearchKeys }));
    dispatch(commonUser({ oldData, oldToken, connectIn: connect }));

    let inputElement = document.getElementById("searchInput"); // Apna input

    inputElement.addEventListener("focusout", function () {
      dispatch(pageKeyChange({ name: "suggestion", value: "0px" }));
    });
  }, []);

  useEffect(() => {
    if (current == "home") {
      const scrollHandler = () => {
        dispatch(
          position({
            name: current,
            current: window.scrollY,
          })
        );
      };
      addEventListener("scroll", scrollHandler);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              dispatch(
                pageKeyChange({
                  name: "scrollFetching",
                  value: Math.floor(Math.random() * 1000),
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

      const items = document.querySelector(`#loading`);
      observer.observe(items);

      // return () => {
      //   // observer.disconnect();
      //   // removeEventListener("scroll", scrollHandler);
      //   // dispatch(pageKeyChange({ name: "current", value: "other" }));
      // };
    } else {
      removeEventListener("scroll", () => {});
    }
  }, [current]);

  const searchFunc = (key, newSort) => {
    let { name, cached, type } = typeof key == "object" ? key : {};
    let page = false;
    let sorted = false;

    const capitalized = name || key || capitalizeWords();

    if (
      (search.keyName === capitalized && !newSort) ||
      newSort == searchSort ||
      (!name && !capitalized) ||
      loading
    ) {
      return;
    }
    let findKey = false;

    keyword.current.value = capitalized;

    const indexIntTofP = intTofP.findIndex((data) => data.name == capitalized);
    const intTPage = intTofP[indexIntTofP]?.page;

    if (!name) {
      findKey = nameKeys.find((keys) => keys.name == capitalized);
      if (!findKey) {
        findKey = searchKeys.find((keys) => keys.name == capitalized);
      }
    }
    if (findKey) {
      name = findKey.name;
      type = findKey.type;
      cached = findKey.cached;
    }
    if (cached) {
      page = (
        cached.find((obj) => obj.page === null) ||
        cached.find((obj) => obj.sorted === (newSort || searchSort))
      )?.page;
    }
    if (intTPage === null || page === null) {
      page = null;
    } else if (intTPage || page) {
      page = intTPage > page ? intTPage : page;
    } else {
      page = 1;
    }
    router.push(Number(type) ? `/product?k=${name}&_id=${type}` : "/");

    type = type
      ? type
      : indexIntTofP >= 0 || tOfPKeys.includes(capitalized)
      ? "tOfP"
      : "key";

    if (page === null || page) {
      dispatch(
        searchSortChange({
          newSort: newSort || searchSort,
          keyName: capitalized,
          type,
        })
      );
    }

    if (type == "tOfP" && search.keyName !== capitalized) {
      dispatch(
        intTofPFunc({
          intTofP,
          name: capitalized,
          token,
          searchKeys,
          indexIntTofP,
        })
      );
    }

    if (capitalized.length < 4) {
      dispatch(
        pageKeyChange({
          name: "pSOS",
          value: { type: "alert", message: "minimum 4 words" },
        })
      );
    } else {
      dispatch(
        searchProduct({
          newKey: capitalized,
          page,
          type,
          sorted: newSort || sorted || searchSort,
        })
      );
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    searchFunc();
  };

  useEffect(() => {
    const value = capitalizeWords();
    if (value.length > 3 || value.length == 0) {
      dispatch(searchKeyChange(value));
    }

    if (value) {
      let filtered = [...tOfPKeys, ...nameKeys];
      filtered = filtered.filter((data) => (data.name || data).includes(value));
      filtered = filtered.slice(0, 10);
      if (
        filtered.length == 0 &&
        value.length > 3 &&
        !searches.includes(value)
      ) {
        dispatch(fetchSearchKeys(value));
      } else {
        dispatch(pageKeyChange({ name: "filteredSearch", value: filtered }));
      }
    }

    if (!value) {
      dispatch(pageKeyChange({ name: "filteredSearch", value: [] }));
    }
  }, [loading]);

  const newSos = aSOS || pSOS;

  useEffect(() => {
    if (newSos) {
      setTimeout(() => {
        if (aSOS) {
          dispatch(activityKey({ name: "aSOS", value: false }));
        } else if (pSOS) {
          dispatch(pageKeyChange({ name: "pSOS", value: false }));
        }
      }, 2000);
    }
  }, [newSos]);

  const deleteSearchKeys = (keyName) => {
    if (loadingA !== "deleting-search") {
      dispatch(removeSearchKeys({ keyName, searchKeys, token, oldSearchKeys }));
    }
  };

  return (
    <header className={style.header} id="header">
      {newSos ? UserAlert(newSos) : null}

      <input
        className={style.sideBarInput}
        type="checkbox"
        name="sideBarBtn"
        id="sideBarBtn"
      />
      <input
        className={style.filterInput}
        type="checkbox"
        name="sortBy"
        id="sortBy"
      />
      <label className={style.dropBox} htmlFor="sideBarBtn"></label>
      <nav id="nav">
        <Link href="/">
          <Image
            src="https://res.cloudinary.com/duxuhsx8x/image/upload/v1693544100/SiteImages/logo_jyamdw.png"
            width={150}
            height={100}
            alt="Web Logo"
          />
        </Link>

        <div className={style.loggedIn}>
          {token ? (
            <Link className={style.orders} href="/admin/user/product/orders">
              <svg viewBox="0 0 98 98" id="list">
                <g data-name="<Group>">
                  <g data-name="<Group>">
                    <circle
                      cx="22"
                      cy="77"
                      r="7.8"
                      fill="#00efd1"
                      data-name="<Group>"
                    ></circle>
                    <circle
                      cx="22"
                      cy="49"
                      r="7.8"
                      fill="#00efd1"
                      data-name="<Group>"
                    ></circle>
                    <circle
                      cx="22"
                      cy="21"
                      r="7.8"
                      fill="#00efd1"
                      data-name="<Group>"
                    ></circle>
                  </g>
                  <g data-name="<Group>">
                    <g data-name="<Group>">
                      <path
                        fill="#808080"
                        d="M83.8,51H38.6a2,2,0,1,1,0-4H83.8a2,2,0,1,1,0,4Z"
                        data-name="<Path>"
                      ></path>
                    </g>

                    <g data-name="<Group>">
                      <path
                        fill="#808080"
                        d="M83.8,23H38.6a2,2,0,0,1,0-4H83.8a2,2,0,0,1,0,4Z"
                        data-name="<Path>"
                      ></path>
                    </g>

                    <g data-name="<Group>">
                      <path
                        fill="#083863"
                        d="M83.8,79H38.6a2,2,0,1,1,0-4H83.8a2,2,0,1,1,0,4Z"
                        data-name="<Path>"
                      ></path>
                    </g>
                  </g>
                </g>
              </svg>
              <p>{numOfNewOrder}</p>
            </Link>
          ) : null}
          <Link
            href={token ? "/admin/user/account" : `/user/${connectIn}`}
            className={style.profileLogo}
          >
            <svg className={style.svg} viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M5.84846399,13.5498221 C7.28813318,13.433801 8.73442297,13.433801 10.1740922,13.5498221 C10.9580697,13.5955225 11.7383286,13.6935941 12.5099314,13.8434164 C14.1796238,14.1814947 15.2696821,14.7330961 15.73685,15.6227758 C16.0877167,16.317132 16.0877167,17.1437221 15.73685,17.8380783 C15.2696821,18.727758 14.2228801,19.3149466 12.4926289,19.6174377 C11.7216312,19.7729078 10.9411975,19.873974 10.1567896,19.9199288 C9.43008411,20 8.70337858,20 7.96802179,20 L6.64437958,20 C6.36753937,19.9644128 6.09935043,19.9466192 5.83981274,19.9466192 C5.05537891,19.9062698 4.27476595,19.8081536 3.50397353,19.6530249 C1.83428106,19.3327402 0.744222763,18.7633452 0.277054922,17.8736655 C0.0967111971,17.5290284 0.00163408158,17.144037 0.000104217816,16.752669 C-0.00354430942,16.3589158 0.0886574605,15.9704652 0.268403665,15.6227758 C0.72692025,14.7330961 1.81697855,14.1548043 3.50397353,13.8434164 C4.27816255,13.6914539 5.06143714,13.5933665 5.84846399,13.5498221 Z M8.00262682,-1.16351373e-13 C10.9028467,-1.16351373e-13 13.2539394,2.41782168 13.2539394,5.40035587 C13.2539394,8.38289006 10.9028467,10.8007117 8.00262682,10.8007117 C5.10240696,10.8007117 2.75131423,8.38289006 2.75131423,5.40035587 C2.75131423,2.41782168 5.10240696,-1.16351373e-13 8.00262682,-1.16351373e-13 Z"
                transform="translate(4 2)"
              ></path>
            </svg>
            <span className={style.span}>
              {token ? fName?.substring(0, 8) : "Profile"}
            </span>
          </Link>
        </div>

        <Link className={style.first} href="/">
          Men
        </Link>
        <Link href="/">Women</Link>
        <Link href="/">kitchen</Link>
        <Link href="/">Kids</Link>
        <Link href="/">Beauty & Health</Link>
        <Link href="/">Electronics</Link>
        <Link href="/">Sports & Fitness</Link>
        <Link href="/">Bags</Link>
        <Link href="/">Footwear</Link>
      </nav>
      {search.keyName ? (
        <>
          <label className={style.filterLabel} htmlFor="sortBy">
            <svg
              fill="#000000"
              width="800px"
              height="800px"
              viewBox="0 0 24 24"
              id="filter-alt"
              data-name="Flat Color"
            >
              <path
                fill="#FFFFFF"
                id="primary"
                d="M19,22a1,1,0,0,1-1-1V14a1,1,0,0,1,2,0v7A1,1,0,0,1,19,22Zm-7,0a1,1,0,0,1-1-1V7a1,1,0,0,1,2,0V21A1,1,0,0,1,12,22ZM5,18a1,1,0,0,1-1-1V3A1,1,0,0,1,6,3V17A1,1,0,0,1,5,18Zm14-7a1,1,0,0,1-1-1V3a1,1,0,0,1,2,0v7A1,1,0,0,1,19,11Z"
              ></path>
              <path
                fill="#00FFFF"
                id="secondary"
                d="M22,12a3,3,0,1,1-3-3A3,3,0,0,1,22,12ZM12,2a3,3,0,1,0,3,3A3,3,0,0,0,12,2ZM5,16a3,3,0,1,0,3,3A3,3,0,0,0,5,16Z"
              ></path>
            </svg>
          </label>

          <label htmlFor="sortBy" className={style.sortBy}>
            <p>
              Sort by:{" "}
              <span>{searchSort == "Popular" ? "--Select--" : searchSort}</span>
            </p>

            <span onClick={() => changeSort("Low to High")}>
              Price:{"( Low to High )"}
            </span>
            <span onClick={() => changeSort("High to Low")}>
              Price:{"( High to Low )"}
            </span>
            <span onClick={() => changeSort("New Arrivals")}>New Arrivals</span>
            <span onClick={() => changeSort("Rating")}>Rating</span>
            <span onClick={() => changeSort("Discount")}>Discount</span>
            {searchSort !== "Sponsored" ? (
              <p onClick={() => changeSort("Popular")}>Clear Sort</p>
            ) : null}
          </label>
        </>
      ) : null}
      <label className={style.sideBarBtn} htmlFor="sideBarBtn">
        <span className={style.first}></span>
        <span className={style.second}></span>
        <span className={style.third}></span>
      </label>
      <div className={style.searchBar}>
        <form className={style.form} id="form" onSubmit={submitHandler}>
          <input
            style={{
              border: suggestion == "1000px" ? "1px solid skyblue" : null,
            }}
            onChange={inputChange}
            className={style.input}
            id="searchInput"
            type="text"
            placeholder="Search products..."
            autoComplete="off"
            ref={keyword}
            onClick={() => {
              if (suggestion === "0px") {
                dispatch(
                  pageKeyChange({ name: "suggestion", value: "1000px" })
                );
              }
            }}
          />
          <div>
            <button className={style.button} type="submit">
              <svg viewBox="0 0 24 24">
                <path
                  fill={loading ? "#FF0000" : "#FFFFFF"}
                  d="M0 0h24v24H0V0z"
                ></path>
                <path
                  d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fil="#000000"
                ></path>
              </svg>
            </button>

            {numOfFiltered ? (
              <svg
                className={style.searchCancel}
                onClick={() => {
                  keyword.current.value = "";
                  dispatch(clearSearch());
                  dispatch(activityKey({ name: "search", value: {} }));
                  dispatch(searchKeyChange(""));
                }}
                viewBox="0 0 24 24"
                id="Close"
              >
                <path
                  d="M13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29-4.3 4.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4.29-4.3 4.29 4.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z"
                  fill="#FFFFFF"
                ></path>
              </svg>
            ) : null}
          </div>
          <Link className={style.cart} href="/admin/user/product/cart?num=0">
            <svg fill="#FFFFFF" viewBox="0 0 36 36">
              <circle fill="#FF0000" cx="13.5" cy="29.5" r="2.5"></circle>
              <circle fill="#FF0000" cx="26.5" cy="29.5" r="2.5"></circle>
              <path d="M33.1,6.39A1,1,0,0,0,32.31,6H9.21L8.76,4.57a1,1,0,0,0-.66-.65L4,2.66a1,1,0,1,0-.59,1.92L7,5.68l4.58,14.47L9.95,21.49l-.13.13A2.66,2.66,0,0,0,9.74,25,2.75,2.75,0,0,0,12,26H28.69a1,1,0,0,0,0-2H11.84a.67.67,0,0,1-.56-1l2.41-2H29.12a1,1,0,0,0,1-.76l3.2-13A1,1,0,0,0,33.1,6.39Z"></path>
            </svg>
            <span>{numOfCartP}</span>
          </Link>
        </form>

        <div style={{ maxHeight: suggestion }} className={style.searchKeys}>
          {(searchKeys.length > 0 && !numOfFiltered
            ? searchKeys
            : filteredSearch
          ).map((key, index) => {
            const name = key.name || key;
            return (
              <div key={index}>
                {numOfFiltered ? (
                  <svg>
                    <path fill="none" d="M0 0h24v24H0V0z"></path>
                    <path
                      d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                      fil="#000000"
                    ></path>
                  </svg>
                ) : null}
                <p onClick={() => searchFunc(key)}>{name}</p>
                {numOfFiltered ? null : (
                  <svg onClick={() => deleteSearchKeys(name)} id="Close">
                    <path
                      d="M13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29-4.3 4.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l4.29-4.3 4.29 4.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42z"
                      fill="#FF0000"
                    ></path>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};
export default Header;
