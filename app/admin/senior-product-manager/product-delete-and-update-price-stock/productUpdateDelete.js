"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import style from "./ProductUpdateDelete.module.css";
import Image from "next/image";
import UpdateDoc from "./updateDoc";
import { Wait } from "@/app/Layouts/toastAndWait";

const ProductAdditionalInfo = ({ token }) => {
  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];
  const [products, setProducts] = useState([]);
  const [wait, setWait] = useState(false);
  const [stateDistrict, setStateDistrict] = useState([]);
  const [manage, setManage] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [selectedState, setSelectedState] = useState("Chhattisgarh");
  const [allDistricts, setAllDistricts] = useState([]);
  const {
    name: deleteName,
    imageSets: deleteColourImg,
    _id,
  } = deleteConfirmation || {};
  const [page, setPage] = useState(1);
  const keywordInput = useRef();

  const selectedStateFunc = (event) => {
    const value = event.target.value;
    setSelectedState(value);
  };
  useEffect(() => {
    const findState = stateDistrict.some(
      (data) => data.state === selectedState
    );
    if (findState) {
      setAllDistricts(
        stateDistrict.find((data) => data.state === selectedState).districts
      );
    } else {
      (async () => {
        const find = await fetch(
          `${process.env.PROTOCOL_AND_HOST}/api/districts?key=${selectedState}`
        );
        const districts = (await find.json()).state;
        setStateDistrict((previous) => [
          ...previous,
          { state: selectedState, districts: districts },
        ]);
        setAllDistricts(districts);
      })();
    }
  }, [selectedState]);
  const findProducts = async () => {
    const keyword = keywordInput.current.value.trim();

    if (keyword.length === 0) {
      return alert("type product name");
    }
    const productData = await fetch(
      `/api/admin/senior-product-manager/product-find`,
      {
        method: "POST",
        body: JSON.stringify({ page, keyword, token }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const result = await productData.json();
    const { success, products, message } = result;
    if (products?.length > 0) {
      setProducts(products);
    }
    if (!success) {
      alert(message);
    }
  };
  const removedProduct = (name) => {
    setProducts((previous) => previous.filter((doc) => doc.name !== name));
  };
  const deleteProduct = async () => {
    setWait(true);
    const public_ids = [];
    for (let color of deleteColourImg) {
      for (let image of color.images) {
        public_ids.push(image.public_id);
      }
    }
    const request = await fetch(
      "/api/admin/senior-product-manager/delete-product",
      {
        method: "POST",
        body: JSON.stringify({ name: deleteName, public_ids, token, _id }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const result = await request.json();

    const { success, message } = result;
    if (success) {
      setWait(false);
      removedProduct(deleteName);
      setDeleteConfirmation();
      setManage(false);
      alert(message);
    } else {
      setWait(false);
      alert(message);
    }
  };

  return (
    <Fragment>
      {wait ? <Wait /> : null}
      {deleteConfirmation ? (
        <div className={style.background}>
          <div className={style.deleteConfirmation}>
            <p className={style.name}>{deleteName}</p>
            <button onClick={() => setDeleteConfirmation()} type="button">
              Cancel
            </button>

            <button onClick={deleteProduct} type="button">
              Confirm
            </button>
          </div>
        </div>
      ) : (
        false
      )}
      <div className={style.mainContainer}>
        <p className={style.heading}>Delete Product and Manage price & stock</p>
        <form className={style.searchBar} action={findProducts}>
          <input ref={keywordInput} type="text" placeholder="search..." />
          <button type="submit">
            <svg viewBox="0 0 24 24">
              <path fill="none" d="M0 0h24v24H0V0z"></path>
              <path
                d="M15.5 14h-.79l-.28-.27c1.2-1.4 1.82-3.31 1.48-5.34-.47-2.78-2.79-5-5.59-5.34-4.23-.52-7.79 3.04-7.27 7.27.34 2.8 2.56 5.12 5.34 5.59 2.03.34 3.94-.28 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                fill="#000000"
              ></path>
            </svg>
          </button>
        </form>
        {manage ? (
          <UpdateDoc
            removedProduct={removedProduct}
            setManage={setManage}
            token={token}
            product={manage}
            useState={useState}
            useRef={useRef}
            Image={Image}
            setWait={setWait}
            allDistricts={allDistricts}
            states={states}
            selectedState={selectedState}
            selectedStateFunc={selectedStateFunc}
          />
        ) : null}
        <div className={style.showDetails}>
          <p className={style.numberOfProduct}>No.</p>
          <p className={style.name}>Name</p>
          <p className={style.updateIcon}>Manage</p>
          <p className={style.deleteKey}>Delete</p>
        </div>
        <section className={style.productsContainer}>
          {products.map((data, index) => {
            const { name, imageSets, _id } = data;

            return (
              <div key={index} className={style.products}>
                <p className={style.numberOfProduct}>{index + 1}.</p>
                <p className={style.name}>{name}</p>
                <svg
                  onClick={() => {
                    setManage(false);
                    setTimeout(() => setManage(data), 1);
                  }}
                  className={style.updateIcon}
                  x="0px"
                  y="0px"
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                >
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
                <p
                  onClick={() => {
                    setDeleteConfirmation({ name, imageSets, _id });
                  }}
                  className={style.deleteKey}
                >
                  Delete
                </p>
              </div>
            );
          })}
        </section>
      </div>
    </Fragment>
  );
};

export default ProductAdditionalInfo;
