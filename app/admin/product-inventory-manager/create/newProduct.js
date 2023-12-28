"use client";
import { useState, Fragment, useRef, useEffect } from "react";
import style from "./newProduct.module.css";
import Image from "next/image";
import KeyValue from "./keyValue";
import Description from "./description";
import { Wait } from "@/app/Layouts/toastAndWait";

const NewProductComponent = ({ token }) => {
  const [images, setImages] = useState([]);
  const imagesLength = images.length;
  const [wait, setWait] = useState(false);
  let [variants, setVariants] = useState([]);
  const totalVariants = variants.length;
  let [keyValueD, setKeyValueD] = useState([["", ""]]);
  let [aInfo, setAInfo] = useState([["", ""]]);
  const [imageSets, setImageSets] = useState([]);
  const [openedVariant, setOpenedVariant] = useState();
  let [description, setDescription] = useState([""]);
  const [varianImageSets, setVariantImageSets] = useState([]);
  let iDInput = useRef();
  let category = useRef();
  let brand = useRef();
  let name = useRef();
  let typeOfProduct = useRef();
  let variantDInput = useRef();
  let vDInput = useRef();
  let imageSetDInput = useRef();
  let aLife = useRef();
  const [openContainer, setOpenContainer] = useState(false);
  const openMultipleVariant = openContainer === "multiple variant";
  const openImageSet = openContainer === "image sets";

  const openContainerFunc = (e) => {
    const data = e.target.value;
    if (openContainer === data) {
      return setOpenContainer();
    }

    if (
      data == "multiple variant" &&
      variants.length === 0 &&
      imageSets.length === 0
    ) {
      alert("Create a image set first");
      return;
    }
    setOpenContainer(data);
  };
  const myForm = new FormData();
  images.forEach((image) => {
    myForm.append("images", image);
  });
  const createProductImagesChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((img, index) => {
      if (img.size > 409600) {
        alert(`greater than 400kb: ${img.name}`);
        delete files[index];
      }
    });
    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImages((old) => [...old, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  useEffect(() => {
    const uniqueValue = new Set(images);
    if (imagesLength !== uniqueValue.size) {
      setImages([...uniqueValue]);
    }
  }, [images]);
  const deleteCreateColorFunc = (index) => {
    const indexImgSet = imageSets[index].iD;

    if (
      variants.some((obj) =>
        obj?.options.some((obj) => obj.optID === indexImgSet)
      )
    ) {
      alert(`${indexImgSet}: image set is used in variants`);
      return;
    }
    imageSets[index] = null;
    setImageSets(imageSets.filter((data) => data !== null));
  };

  const addImgFunction = () => {
    const iD = iDInput.current.value.trim();
    if (imagesLength > 4 || imagesLength < 1 || iD.length < 1) {
      alert("Please check images quantity");
      return;
    }
    if (imageSets.some((obj) => obj?.iD === iD)) {
      alert(`${iD}: image set is already created`);
      return;
    }
    setImageSets((previous) => [...previous, { iD, images }]);
    iDInput.current.value = "";
    setImages([]);
  };

  const imgDeleteFunc = (index) => {
    setImages((previous) => {
      previous[index] = null;
      return previous.filter((data) => data !== null);
    });
  };
  const varianAndImageSetFunc = (event) => {
    const vD = vDInput.current.value.trim();
    if (vD.length === 0) {
      alert("please check the difference input");
      return;
    }
    if (variants.find((obj) => obj.vD === vD)) {
      alert("Variant of this difference is already created");
      return;
    }
    const aLifeInput = +aLife.current.value;
    if (aLifeInput > 730) {
      return alert("please check average product life");
    }
    setVariants((previous) => [
      ...previous,
      {
        vD,
        aLife: aLifeInput,
        varKVD: [["", ""]],
        options:
          imageSets.length > 0 && varianImageSets.length === 0
            ? imageSets.map((colorObj) => {
                return { optID: colorObj.iD };
              })
            : varianImageSets.map((opt) => {
                return { optID: opt };
              }),
      },
    ]);
    setVariantImageSets([]);
  };
  const deleteCreateVariantFunc = (index) => {
    if (openedVariant >= 0) {
      setOpenedVariant();
    }
    setVariants((previous) => {
      previous[index] = null;
      return previous.filter((obj) => obj !== null);
    });
  };

  async function addProduct(event) {
    event.preventDefault();
    function capitalizeWords(str) {
      return str.replace(/\b\w/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }
    let variantD = variantDInput.current?.value.trim();
    if (variants.length > 0) {
      if (!variantD) {
        return alert("What is the difference between the variants?");
      }
      variantD = capitalizeWords(variantD.toLowerCase());
    }
    if (imageSets.length < 1) {
      alert("Upload Minimum 1 image Set");
    } else if (imageSets.length > 4) {
      alert("Upload Maximum 4 image Set");
    } else if (
      description.length < 0 ||
      keyValueD.length < 3 ||
      aInfo.length < 0
    ) {
      alert("Please write product description");
    } else {
      keyValueD = keyValueD.filter((data, index) => index !== 0);
      description = description.filter((data, index) => index !== 0);
      aInfo = aInfo.filter((data, index) => index !== 0);
      if (variantD) {
        variants = variants.map((variant, index) => {
          let { vD, varKVD, options, aLife } = variant;

          const obj = { vD, options };
          if (aLife) {
            obj.aLife = aLife;
          }

          if (varKVD.length > 1) {
            varKVD = varKVD.filter((data, index) => index !== 0);
            obj.varKVD = varKVD;
          }
          return obj;
        });
      } else {
        variants.push({
          aLife: aLife.current.value,
          options: imageSets.map((colorObj) => {
            return { optID: colorObj.iD };
          }),
        });
      }

      setWait(true);
      let categoryCapitalize = category.current.value.toLowerCase().trim();
      let brandCapitalize = brand.current.value.toLowerCase().trim();
      let tOfP = typeOfProduct.current.value.toLowerCase().trim();

      categoryCapitalize = capitalizeWords(categoryCapitalize);
      tOfP = capitalizeWords(tOfP);
      brandCapitalize = capitalizeWords(brandCapitalize);

      let imageSetD = imageSetDInput.current.value.trim();
      imageSetD = capitalizeWords(imageSetD.toLowerCase());
      let newProduct = await fetch(
        `/api/admin/product-inventory-manager/create`,
        {
          method: "POST",
          body: JSON.stringify({
            name: name.current.value.trim(),
            category: categoryCapitalize,
            description,
            brand: brandCapitalize || "",
            keyValueD,
            tOfP,
            token,
            imageSetD,
            imageSets,
            variants,
            variantD,
            aInfo,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await newProduct.json();
      const { success, message } = result;
      if (success) {
        setWait(false);
        alert(message);
        setImages([]);
        setImageSets([]);
        setVariants([]);
        setOpenContainer(false);
        setDescription([""]);
        setKeyValueD([["", ""]]);
        setAInfo([["", ""]]);
        setOpenedVariant();
        name.current.value = "";
        category.current.value = "";
        brand.current.value = " ";
        typeOfProduct.current.value = "";
        variantDInput.current.value = " ";
        aLife.current.value = "";
      } else {
        if (!variantD) {
          variants.pop();
        }
        setWait(false);
        alert(message);
      }
    }
  }
  const setKeyValueData = (key, value, name, oldKey) => {
    let keyData = key.trim();
    let valueData = value.trim();
    if (keyData.length < 1 || valueData.length < 1) {
      alert("please fill input");
      return false;
    }

    const currentCom = name === "keyValueDes";
    if (!oldKey || oldKey ? oldKey !== keyData : false) {
      const findKey = (currentCom ? keyValueD : aInfo).some(
        (data) => data[0] === keyData
      );
      if (findKey) {
        alert("This key already exists");
        return false;
      }
    }
    (currentCom ? setKeyValueD : setAInfo)((previous) => {
      const arr = [keyData, valueData];
      if (oldKey) {
        previous.forEach((data, index) => {
          if (data[0] === oldKey) {
            previous[index] = arr;
          }
          return data;
        });
        return [...previous];
      } else {
        return [...previous, arr];
      }
    });
    return true;
  };

  const deleteKeyValue = (key, name) => {
    const currentCom = name === "keyValueDes";
    (currentCom ? setKeyValueD : setAInfo)([{ "": "" }]);
    const filtered = (currentCom ? keyValueD : aInfo).filter(
      (data) => data[0] !== key
    );
    setTimeout(() => (currentCom ? setKeyValueD : setAInfo)(filtered), 300);
  };

  const funcSetDescriptionData = (data, oldDec) => {
    let des = data.trim();
    const findData = description.some((data) => data === des);
    if (findData) {
      alert("This data already exists");
      return false;
    }
    const findIndex = description.indexOf(oldDec);
    if (findIndex) {
      description[findIndex] = des;
    } else {
      description.push(des);
    }

    setDescription([...description]);
    return true;
  };

  const deleteDescription = (des) => {
    setDescription([]);
    const filtered = description.filter((data) => data !== des);
    setTimeout(() => setDescription(filtered), 1000);
  };
  const funcOpenContainerVar = (index) => {
    setOpenedVariant();
    if (openedVariant !== index) {
      setTimeout(() => setOpenedVariant(index), 300);
    }
  };
  const varKVD = variants[openedVariant]?.varKVD;

  const funcSetVarKeyValueData = (key, value, name, oldKey) => {
    let keyData = key.trim();
    let valueData = value.trim();
    if (keyData.length < 1 || valueData.length < 1) {
      alert("please fill input");
      return false;
    }
    if (oldKey !== keyData) {
      const findKey = varKVD.some((data) => data[0] === keyData);

      if (findKey) {
        alert("This key already exists");
        return false;
      }
    }

    const arr = [keyData, valueData];
    if (oldKey) {
      varKVD.forEach((data, index) => {
        if (data[0] === oldKey) {
          varKVD[index] = arr;
        }
      });
    } else {
      varKVD.push(arr);
    }

    setVariants((previous) => {
      previous[openedVariant].varKVD = varKVD;
      return previous;
    });
    setTimeout(() => setOpenedVariant(openedVariant), 1);
    setOpenedVariant();

    return true;
  };
  const varDeleteKeyValue = (key) => {
    setVariants((previous) => {
      let filteredVarKVD = varKVD.filter((data, index) => data[0] !== key);
      previous[openedVariant].varKVD = filteredVarKVD;
      return [...previous];
    });
    setOpenedVariant();
    setTimeout(() => setOpenedVariant(openedVariant), 300);
  };
  return (
    <Fragment>
      <section className={style.section} id="productManagersPanels">
        {wait ? <Wait /> : null}
        <div className={style.container}>
          <h1>Add New Product</h1>
          <form onSubmit={addProduct}>
            <label htmlFor="name">Name</label>
            <input
              maxLength={75}
              ref={name}
              required
              id="name"
              type="text"
              placeholder="प्रोडक्ट का नाम लिखें..."
            />
            <label htmlFor="category">Category</label>
            <input
              maxLength={25}
              ref={category}
              required
              id="category"
              type="text"
              placeholder="वर्ग लिखे अपने प्रोडक्ट का: Sports / Furniture / Decoration Light / Smartphones / Mobile Accessories ..."
            />
            <label htmlFor="brand">Brand</label>
            <input
              maxLength={35}
              ref={brand}
              id="brand"
              type="text"
              placeholder="प्रोडक्ट का ब्रांड:LG / Samsung / Intex / Logitech / Gucci / Nike / Adidas / Puma  ..."
            />
            <label htmlFor="typeOfProduct">Type Of Product</label>
            <input
              ref={typeOfProduct}
              maxLength={25}
              required
              id="typeOfProduct"
              type="text"
              placeholder="प्रोडक्ट क्या है: Mobile / Tv / Watch / Laptop / Wall Light / Game / Toy / AC / Speaker / SubWoofer ..."
            />
            <label htmlFor="keyValue">Key Value Description</label>
            <div className={style.keyValues}>
              {keyValueD.map((data, index) => (
                <KeyValue
                  key={index}
                  useState={useState}
                  keyData={data[0]}
                  valueData={data[1]}
                  setKeyValueData={setKeyValueData}
                  useRef={useRef}
                  deleteKeyValue={deleteKeyValue}
                  name={"keyValueDes"}
                />
              ))}
            </div>
            <label htmlFor="description">Description</label>
            <div className={style.description}>
              {description.map((data, index) => (
                <Description
                  key={index}
                  description={data}
                  setDescriptionData={funcSetDescriptionData}
                  useState={useState}
                  useRef={useRef}
                  deleteDescription={deleteDescription}
                />
              ))}
            </div>
            <label htmlFor="s">Additional Information</label>
            <div className={style.keyValues}>
              {aInfo.map((data, index) => (
                <KeyValue
                  key={index}
                  useState={useState}
                  keyData={data[0]}
                  valueData={data[1]}
                  useRef={useRef}
                  setKeyValueData={setKeyValueData}
                  deleteKeyValue={deleteKeyValue}
                />
              ))}
            </div>
            <label className={style.selectContainer}>
              Images Set:
              <button
                type="button"
                value="image sets"
                onClick={openContainerFunc}
                style={{
                  backgroundColor: openImageSet ? "aqua" : "red",
                }}
              ></button>
            </label>

            <label
              className={style.colorAndVariantType}
              htmlFor="imageSetDifference"
            >
              What is the difference between image sets:
              <input
                defaultValue="Colour"
                ref={imageSetDInput}
                type="text"
                id="imageSetDifference"
              />
            </label>
            <label
              className={style.colorAndVariantType}
              id="aLife"
              htmlFor="aLife"
            >
              Average life (days) :
              <input
                ref={aLife}
                type="number"
                placeholder="Max 730 days"
                name="aLife"
                id={style.aLife}
              />
            </label>
            {openImageSet ? (
              <div className={style.createColorsDiv}>
                <p className={style.creationType}>Create Image Set</p>
                <div className={style.createdColors}>
                  {imageSets.map((data, index) => {
                    const { iD, images } = data;
                    return (
                      <div key={index} className={style.createdColor}>
                        <p>{iD}</p>
                        <svg onClick={() => deleteCreateColorFunc(index)}>
                          <path
                            fill="#FF0000"
                            d="M7 18a1 1 0 0 1-.707-1.707l10-10a1 1 0 0 1 1.414 1.414l-10 10A.997.997 0 0 1 7 18Z"
                          ></path>
                          <path
                            fill="#FF0000"
                            d="M17 18a.997.997 0 0 1-.707-.293l-10-10a1 1 0 0 1 1.414-1.414l10 10A1 1 0 0 1 17 18Z"
                          ></path>
                        </svg>
                        <Image
                          width={300}
                          height={200}
                          src={images[0]}
                          alt={"create color"}
                        />
                      </div>
                    );
                  })}
                </div>

                <label className={style.label}>
                  Difference: <input ref={iDInput} type="text" />
                </label>
                <div className={style.productImageDiv}>
                  {images.map((img, index) => (
                    <div className={style.imgDiv} key={index}>
                      <svg onClick={() => imgDeleteFunc(index)}>
                        <path
                          fill="#FF0000"
                          d="M7 18a1 1 0 0 1-.707-1.707l10-10a1 1 0 0 1 1.414 1.414l-10 10A.997.997 0 0 1 7 18Z"
                        ></path>
                        <path
                          fill="#FF0000"
                          d="M17 18a.997.997 0 0 1-.707-.293l-10-10a1 1 0 0 1 1.414-1.414l10 10A1 1 0 0 1 17 18Z"
                        ></path>
                      </svg>
                      <Image
                        className={style.productImage}
                        key={index}
                        alt="product img"
                        width={300}
                        height={200}
                        src={img}
                      />
                    </div>
                  ))}
                </div>
                <label className={style.selectImages} htmlFor="images">
                  Choose Product Images:
                  <input
                    className={style.inputImages}
                    onChange={createProductImagesChange}
                    name="images"
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                  />
                  <button
                    style={{
                      display: imagesLength > 0 ? "inline-block" : "none",
                    }}
                    onClick={addImgFunction}
                    className={style.addImg}
                    type="button"
                  >
                    Add Images
                  </button>
                </label>
              </div>
            ) : null}
            <label className={style.selectContainer}>
              Multiple Variants And Image
              <button
                type="button"
                value="multiple variant"
                onClick={openContainerFunc}
                style={{
                  backgroundColor: openMultipleVariant ? "aqua" : "red",
                }}
              ></button>
            </label>
            <label className={style.colorAndVariantType}>
              What is the difference between the products:
              <input type="text" ref={variantDInput} />
            </label>
            {openMultipleVariant ? (
              <div className={style.multipleVariantsDiv}>
                <p className={style.creationType}>Create multiple variants</p>
                <div className={style.createdVariants}>
                  {variants.map((obj, index) => {
                    const { vD, options } = obj;
                    return (
                      <div key={index} className={style.variant}>
                        <span>
                          {index + 1}: {vD}
                        </span>
                        {options?.length > 0 ? (
                          <p>
                            option:
                            {options.map((color, index) => (
                              <span key={index}>{color.optID}</span>
                            ))}
                          </p>
                        ) : null}
                        <svg onClick={() => deleteCreateVariantFunc(index)}>
                          <path
                            fill="#FF0000"
                            d="M7 18a1 1 0 0 1-.707-1.707l10-10a1 1 0 0 1 1.414 1.414l-10 10A.997.997 0 0 1 7 18Z"
                          ></path>
                          <path
                            fill="#FF0000"
                            d="M17 18a.997.997 0 0 1-.707-.293l-10-10a1 1 0 0 1 1.414-1.414l10 10A1 1 0 0 1 17 18Z"
                          ></path>
                        </svg>
                      </div>
                    );
                  })}
                </div>
                <div className={style.createdColors}>
                  {imageSets.map((data, index) => {
                    const { iD, images } = data;
                    return (
                      <div
                        style={{
                          boxShadow: varianImageSets.includes(iD)
                            ? "inset 200px 0px 0px 0px #e6e6e62b"
                            : null,
                        }}
                        onClick={() =>
                          setVariantImageSets((previous) => {
                            if (varianImageSets.includes(iD)) {
                              return previous.filter((data) => data !== iD);
                            } else {
                              return [...previous, iD];
                            }
                          })
                        }
                        key={index}
                        className={style.createdColor}
                      >
                        <p>{iD}</p>
                        <Image
                          width={300}
                          height={200}
                          src={images[0]}
                          alt={"create color"}
                        />
                      </div>
                    );
                  })}
                </div>
                <label className={style.difference}>
                  Difference : <input ref={vDInput} type="text" />
                  <button type="button" onClick={varianAndImageSetFunc}>
                    Create Variant
                  </button>
                </label>
              </div>
            ) : null}
            {totalVariants > 0 ? (
              <div className={style.variants}>
                <p>Variants:</p>
                {variants.map((data, index) => (
                  <span
                    onClick={() => funcOpenContainerVar(index)}
                    style={{
                      boxShadow: `inset 0px 0px 4px 0px ${
                        openedVariant === index ? "rgb(48, 211, 48)" : "white"
                      }`,
                    }}
                    key={index}
                  >
                    {data.vD}
                  </span>
                ))}
              </div>
            ) : null}
            {openedVariant >= 0 ? (
              <div className={style.keyValues}>
                {varKVD.map((data, index) => (
                  <KeyValue
                    key={index}
                    useState={useState}
                    keyData={data[0]}
                    valueData={data[1]}
                    setKeyValueData={funcSetVarKeyValueData}
                    useRef={useRef}
                    deleteKeyValue={varDeleteKeyValue}
                    name={"varKVD"}
                  />
                ))}
              </div>
            ) : null}
            <button className={style.submitBtn} type="submit">
              Add Product
            </button>
          </form>
        </div>
      </section>
    </Fragment>
  );
};
export default NewProductComponent;
