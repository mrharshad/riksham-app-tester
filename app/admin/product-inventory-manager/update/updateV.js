"use client";
import KeyValue from "../create/keyValue";
import style from "./updateV.module.css";
const UpdateV = ({
  Fragment,
  product,
  removeProduct,
  token,
  useState,
  useRef,
  useEffect,
  Image,
  setWait,
}) => {
  if (!product) {
    return;
  }
  const {
    _id,
    variantD: oldVariantDifference,
    imageSets: oldImageSets,
    variants: oldVariants,
    imageSetD: oldImageSetD,
    name,
  } = product;
  const [images, setImages] = useState([]);
  const imagesLength = images.length;

  let [variants, setVariants] = useState(oldVariants);
  const { vD: firstVarVD, aLife: firstVarALife } = variants[0];

  const [imageSets, setImageSets] = useState(oldImageSets);
  const imageSetsLength = imageSets.length;
  let [varianImageSets, setVariantImageSets] = useState([]);
  const [deletingSelectedImg, setDeletingSelectedImg] = useState([]);
  const [editImageSetIndex, setEditImageSetIndex] = useState();
  const [openContainer, setOpenContainer] = useState(false);
  const [editVariantIndex, setEditVariantIndex] = useState();
  const [openedVariant, setOpenedVariant] = useState();
  let multipleInput = useRef();
  let variantDInput = useRef();
  let imageSetDInput = useRef();
  let multipleInputBtn = useRef();
  let aLife = useRef();
  let aLifeMultiVar = useRef();

  const totalVariant = variants.length;
  const openMultipleVariant = openContainer === "multiple variant";
  const openImageSet = openContainer === "image sets";

  useEffect(() => {
    if (oldVariantDifference) {
      setVariants((previous) => {
        previous.forEach((data, index) => {
          let variantKVD = previous[index].varKVD;
          let [key] = variantKVD[0] || [[]];
          if (key !== "") {
            variantKVD.unshift(["", ""]);
            previous[index].varKVD = variantKVD;
          }
        });
        return [...previous];
      });
    }
  }, []);
  const openContainerFunc = (e) => {
    const data = e.target.value;
    if (openContainer === data) {
      return setOpenContainer();
    }
    if (editImageSetIndex >= 0) {
      setEditImageSetIndex();
    }

    if (editVariantIndex >= 0) {
      setEditVariantIndex();
    }
    if (data === "multiple variant" && imageSetsLength === 0) {
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
    let uniqueValue = new Set(images);
    if (editImageSetIndex >= 0) {
      setImageSets((previous) => {
        let oldImages = previous[editImageSetIndex].images;
        uniqueValue = oldImages.concat([...uniqueValue]);
        uniqueValue = new Set(uniqueValue);
        oldImages = [...uniqueValue].slice(0, 4);
        previous[editImageSetIndex].images = oldImages;
        return previous;
      });

      setEditImageSetIndex();
      if (imagesLength > 0) {
        setImages([]);
      }
      setTimeout(() => {
        setEditImageSetIndex(editImageSetIndex);
      }, 100);
    } else if (imagesLength !== uniqueValue.size) {
      setImages([...uniqueValue]);
    }
  }, [images]);

  const funcDeleteImageSet = (index, url) => {
    const indexImgSet = imageSets[index].iD;
    if (
      variants.some((obj) =>
        obj?.options.some((obj) => obj.optID === indexImgSet)
      )
    ) {
      alert(`${indexImgSet}: image set is used in variants`);
      return;
    }
    if (url) {
      imageSets[index].images.forEach((data) =>
        setDeletingSelectedImg((previous) => [...previous, data.public_id])
      );
    }
    imageSets[index] = null;
    setImageSets(imageSets.filter((data) => data !== null));
  };
  const funcDeleteImage = (imageIndex, public_id) => {
    let images = imageSets[editImageSetIndex].images;
    let totalImg = images.length;
    if (imageSets[editImageSetIndex].images.length === 1) {
      return alert(
        "If you want to remove the first image then upload more images first."
      );
    }
    setImageSets((previous) => {
      images = images.filter((img, index) => index !== imageIndex);
      if (images.length === totalImg - 1) {
        previous[editImageSetIndex].images = images;
      }
      return [...previous];
    });

    if (public_id) {
      setDeletingSelectedImg((previous) => [...previous, public_id]);
    }
  };
  const addImgFunction = (event) => {
    const iD = multipleInput.current.value.trim();
    if (imagesLength > 4 || imagesLength < 1 || iD.length < 1) {
      alert("Please check images quantity");
      return;
    }
    if (imageSets.some((obj) => obj?.iD === iD)) {
      alert(`${iD}: image set is already created`);
      return;
    }
    if (totalVariant <= 1 && !variants[0]?.vD) {
      setVariants((previous) => {
        if (previous[0]?.options) {
          previous[0].options.push({ optID: iD });
        } else {
          previous[0] = { options: [{ optID: iD }] };
        }
        return [...previous];
      });
    }
    setImageSets((previous) => [...previous, { iD, images }]);
    multipleInput.current.value = "";
    setImages([]);
  };

  const imgDeleteFunc = (index) => {
    setImages((previous) => {
      previous[index] = null;
      return previous.filter((data) => data !== null);
    });
  };
  const varianAndImageSetFunc = () => {
    const vD = multipleInput.current.value.trim();
    if (vD.length === 0) {
      alert("please check the difference input");
      return;
    }

    const findVariantIndex = variants.findIndex((obj) => obj.vD === vD);
    const aLifeInput = +aLife.current.value;
    if (findVariantIndex >= 0) {
      setVariants((previous) => {
        const createdOptions = previous[findVariantIndex].options;

        if (varianImageSets.length === 0) {
          varianImageSets = imageSets.map((data) => data.iD);
        }
        varianImageSets.forEach((data) => {
          if (!createdOptions.some((opt) => opt.optID === data)) {
            createdOptions.push({ optID: data });
          }
        });
        previous[findVariantIndex].options = createdOptions;
        return [...previous];
      });
    } else if (totalVariant > 0 && !variants[0]?.vD) {
      setVariants((previous) => {
        previous[0].varKVD = [["", ""]];
        previous[0].vD = vD;
        previous[0].aLife = previous[0].aLife || aLifeInput;
        return previous;
      });
    } else {
      setVariants((previous) => {
        return [
          ...previous,
          {
            vD,
            varKVD: [["", ""]],
            aLife: aLifeInput,
            options:
              varianImageSets.length == 0
                ? imageSets.map((set) => {
                    return { optID: set.iD };
                  })
                : varianImageSets.map((opt) => {
                    return { optID: opt };
                  }),
          },
        ];
      });
    }
    multipleInputBtn.current.style.opacity = 0;
    multipleInputBtn.current.style.visibility = "hidden";
    // multipleInput.current.value = "";
    setVariantImageSets([]);
  };

  const deleteCreateVariantFunc = (index) => {
    const options = variants[index].options;
    const findQty = options.some((opt) =>
      opt.loc?.some((state) => state.d.some((district) => district.qty > 0))
    );
    if (findQty) {
      return alert(
        "This variant has stock available so the senior product manager can remove it"
      );
    }
    if (openedVariant >= 0) {
      setOpenedVariant();
    }
    setVariants((previous) => {
      previous[index] = null;
      return previous.filter((obj) => obj !== null);
    });
  };

  const funcDeleteVariantOption = (index) => {
    let options = variants[editVariantIndex].options;
    const optionLength = options.length;
    if (optionLength === 1) {
      return alert("Variant must have 1 option");
    }
    const findQty = options.some((opt) =>
      opt.loc?.some((state) => state.d.some((district) => district.qty > 0))
    );
    if (findQty) {
      return alert(
        "This variant has stock available so the senior product manager can remove it"
      );
    }
    options[index] = null;
    options = options.filter((opt) => opt !== null);
    setVariants((previous) => {
      previous[editVariantIndex].options = options;
      return [...previous];
    });
  };

  const funcOpenContainer2 = (index) => {
    if (openContainer) {
      setOpenContainer();
    }
    if (editVariantIndex >= 0) {
      setEditVariantIndex();
    }
    if (editImageSetIndex === index) {
      setEditImageSetIndex();
    } else {
      setEditImageSetIndex();
      setTimeout(() => {
        setEditImageSetIndex(index);
      }, 300);
    }
  };

  const funcOpenContainer3 = (index) => {
    if (openContainer) {
      setOpenContainer();
    }
    if (editImageSetIndex >= 0) {
      setEditImageSetIndex();
    }
    setEditVariantIndex(index);
    if (editVariantIndex === index) {
      setEditVariantIndex();
    } else {
      setEditVariantIndex();
      setTimeout(() => {
        setEditVariantIndex(index);
      }, 500);
    }
  };

  const funcEditImageOrder = (index, clicked) => {
    const images = imageSets[editImageSetIndex].images;
    let newImagSet = images.with(
      index,
      clicked === "right" ? images[index + 1] : images[index - 1]
    );
    newImagSet = newImagSet.with(
      clicked === "right" ? index + 1 : index - 1,
      images[index]
    );
    setImageSets((previous) => {
      previous[editImageSetIndex].images = newImagSet;
      return previous;
    });
    setEditImageSetIndex();
    setTimeout(() => {
      setEditImageSetIndex(editImageSetIndex);
    }, 300);
  };
  const funcVariantOrder = (index, clicked) => {
    setVariants((previous) => {
      const variants = previous;
      previous = previous.with(
        index,
        clicked === "right" ? variants[index + 1] : variants[index - 1]
      );
      previous = previous.with(
        clicked === "right" ? index + 1 : index - 1,
        variants[index]
      );
      return previous;
    });
  };
  const funcEditVariantOptionsOrder = (index, clicked) => {
    const options = variants[editVariantIndex].options;
    let newOption = options.with(
      index,
      clicked === "right" ? options[index + 1] : options[index - 1]
    );
    newOption = newOption.with(
      clicked === "right" ? index + 1 : index - 1,
      options[index]
    );

    setVariants((previous) => {
      previous[editVariantIndex].options = newOption;
      return previous;
    });
    setEditVariantIndex();
    setTimeout(() => {
      setEditVariantIndex(editVariantIndex);
    }, 300);
  };

  const multipleInputChange = (old, aLifeOld) => {
    const value = multipleInput.current.value.trim();

    const value2 = +aLifeMultiVar?.current?.value;
    if (
      (old !== value && value.length > 0) ||
      (aLifeOld ? aLifeOld !== value2 && value2 <= 730 : null)
    ) {
      multipleInputBtn.current.style.opacity = 9;
      multipleInputBtn.current.style.visibility = "visible";
    } else {
      multipleInputBtn.current.style.opacity = 0;
      multipleInputBtn.current.style.visibility = "hidden";
    }
  };
  const funcEditImageSetName = () => {
    const nameInput = multipleInput.current.value.trim();
    const findImageSetName = imageSets.some(
      (imgSet) => imgSet.iD.toLowerCase() === nameInput.toLowerCase()
    );
    const oldName = imageSets[editImageSetIndex].iD;
    if (findImageSetName) {
      return alert("Image set already exists with this name");
    }
    setImageSets((previous) => {
      previous[editImageSetIndex].iD = nameInput;
      return previous;
    });
    setVariants((previous) => {
      previous.forEach((variant, varIndex) => {
        variant.options.forEach((opt, optIndex) => {
          if (opt.optID === oldName) {
            previous[varIndex].options[optIndex].optID = nameInput;
          }
        });
      });
      return previous;
    });
    setEditImageSetIndex();
    setTimeout(() => {
      setEditImageSetIndex(editImageSetIndex);
    }, 400);
  };
  const funcEditVd = () => {
    const vD = multipleInput.current.value.trim();
    const aLifeInput = +aLifeMultiVar.current.value;
    const findVariant = variants[editVariantIndex];

    if (
      findVariant.vD === vD.toLowerCase() &&
      findVariant.aLife === aLifeInput
    ) {
      return alert("variant already exists");
    }
    if (aLifeInput > 730) {
      return alert("please check product average life");
    }
    setVariants((previous) => {
      previous[editVariantIndex].vD = vD;
      previous[editVariantIndex].aLife = aLifeInput;
      return previous;
    });
    setEditVariantIndex();
    setTimeout(() => {
      setEditVariantIndex(editVariantIndex);
    }, 200);
  };
  async function updateProduct() {
    function capitalizeWords(str) {
      return str.replace(/\b\w/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    }

    let newImagesCount = 0;
    imageSets.forEach((colorObj, index) => {
      const { images } = colorObj;
      images.forEach((img, index) => {
        if (!img?.public_id) {
          newImagesCount = newImagesCount + 1;
        }
      });
    });

    let variantD = variantDInput.current.value.trim();

    let aLifeInput = +aLife?.current?.value;

    if (variants.length > 0) {
      if (!variantD && firstVarVD) {
        return alert("What is the difference between the variants?");
      }

      variants = variants.map((varian, index) => {
        let { vD, varKVD, options, aLife } = varian;
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
      if (!variantD) {
        variants[0].aLife = aLifeInput;
      }
      variantD = capitalizeWords(variantD.toLowerCase());
    } else {
      variantD = "";
      variants.push({
        aLife: aLifeInput,
        options: imageSets.map((colorObj) => {
          return { vD: colorObj.iD };
        }),
      });
    }
    if (imageSetsLength < 1) {
      alert("Upload Minimum 1 image Set");
    } else {
      setWait(true);
      let imageSetD = imageSetDInput.current.value.trim();
      imageSetD = capitalizeWords(imageSetD.toLowerCase());

      let updateProduct = await fetch(
        `/api/admin/product-inventory-manager/update-v-i-set`,
        {
          method: "PUT",
          body: JSON.stringify({
            _id,
            token,
            name,
            imageSets,
            variants,
            imageSetD: imageSetD || "",
            variantD: variantD || "",
            deletingSelectedImg,
            newImagesCount,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await updateProduct.json();
      const { success, message } = result;
      if (success) {
        setWait(false);
        removeProduct(_id);
        alert(message);
      } else {
        setWait(false);
        alert(message);
      }
    }
  }
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
    if (!oldKey || oldKey ? oldKey !== keyData : false) {
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
    setTimeout(() => setOpenedVariant(openedVariant), 1);
    setVariants((previous) => {
      previous[openedVariant].varKVD = varKVD;
      return previous;
    });
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
    <div className={style.container}>
      <h1>
        Update Img Sets and Options:
        <svg
          onClick={() => {
            removeProduct(_id);
          }}
        >
          <path
            fill="#FF0000"
            d="M7 18a1 1 0 0 1-.707-1.707l10-10a1 1 0 0 1 1.414 1.414l-10 10A.997.997 0 0 1 7 18Z"
          ></path>
          <path
            fill="#FF0000"
            d="M17 18a.997.997 0 0 1-.707-.293l-10-10a1 1 0 0 1 1.414-1.414l10 10A1 1 0 0 1 17 18Z"
          ></path>
        </svg>
      </h1>
      <div className={style.imageSets}>
        <span className={style.span}>image set:</span>
        {imageSets.map((data, index) => (
          <p
            style={
              index === editImageSetIndex
                ? { boxShadow: " inset 0px 0px 5px 0px rgb(48 211 48)" }
                : null
            }
            key={index}
            className={style.div}
            onClick={() => funcOpenContainer2(index)}
          >
            {data.iD}
          </p>
        ))}
      </div>
      {editImageSetIndex >= 0
        ? (function () {
            const { iD, images } = imageSets[editImageSetIndex];

            return (
              <div className={style.editImageSetContainer}>
                <div className={style.label}>
                  image set name:{" "}
                  <input
                    onChange={() => multipleInputChange(iD)}
                    ref={multipleInput}
                    type="text"
                    defaultValue={iD}
                  />
                  <button
                    onClick={funcEditImageSetName}
                    ref={multipleInputBtn}
                    type="button"
                  >
                    Set Name
                  </button>
                </div>

                <div id={style.editImgSet} className={style.createdColors}>
                  {images.map((img, index) => {
                    const { url, public_id } = img;
                    const totalImages = images.length;
                    return (
                      <div className={style.createdColor} key={index}>
                        <svg onClick={() => funcDeleteImage(index, public_id)}>
                          <path
                            fill="#FF0000"
                            d="M7 18a1 1 0 0 1-.707-1.707l10-10a1 1 0 0 1 1.414 1.414l-10 10A.997.997 0 0 1 7 18Z"
                          ></path>
                          <path
                            fill="#FF0000"
                            d="M17 18a.997.997 0 0 1-.707-.293l-10-10a1 1 0 0 1 1.414-1.414l10 10A1 1 0 0 1 17 18Z"
                          ></path>
                        </svg>
                        {totalImages > 1 && index > 0 ? (
                          <svg
                            onClick={() => funcEditImageOrder(index, "left")}
                            viewBox="0 0 512 512"
                            className={style.leftArrow}
                          >
                            <path
                              d="m327.3 98.9-2.1 1.8-156.5 136c-5.3 4.6-8.6 11.5-8.6 19.2 0 7.7 3.4 14.6 8.6 19.2L324.9 411l2.6 2.3c2.5 1.7 5.5 2.7 8.7 2.7 8.7 0 15.8-7.4 15.8-16.6V112.6c0-9.2-7.1-16.6-15.8-16.6-3.3 0-6.4 1.1-8.9 2.9z"
                              fill=" #3385ff"
                            ></path>
                          </svg>
                        ) : null}
                        {totalImages > 1 && totalImages > index + 1 ? (
                          <svg
                            className={style.rightArrow}
                            onClick={() => funcEditImageOrder(index, "right")}
                            viewBox="0 0 512 512"
                          >
                            <path
                              d="m184.7 413.1 2.1-1.8 156.5-136c5.3-4.6 8.6-11.5 8.6-19.2 0-7.7-3.4-14.6-8.6-19.2L187.1 101l-2.6-2.3C182 97 179 96 175.8 96c-8.7 0-15.8 7.4-15.8 16.6v286.8c0 9.2 7.1 16.6 15.8 16.6 3.3 0 6.4-1.1 8.9-2.9z"
                              fill="#3385ff"
                            ></path>
                          </svg>
                        ) : null}
                        <Image
                          className={style.productImage}
                          key={index}
                          alt="product img"
                          width={300}
                          height={200}
                          src={url || img}
                        />
                      </div>
                    );
                  })}
                </div>
                <label className={style.selectImages} htmlFor="images">
                  Add new image:
                  <input
                    className={style.inputImages}
                    onChange={createProductImagesChange}
                    name="images"
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                  />
                </label>
              </div>
            );
          })()
        : null}
      <label id={style.imgSetContainer} className={style.selectContainer}>
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
      <label className={style.colorAndVariantType} htmlFor="imageSetDifference">
        What is the difference between image sets:
        <input
          ref={imageSetDInput}
          defaultValue={oldImageSetD}
          type="text"
          id="imageSetDifference"
        />
      </label>
      {openImageSet ? (
        <div className={style.createColorsDiv}>
          <p className={style.creationType}>Update Image Set</p>
          <div className={style.createdColors}>
            {imageSets.map((data, index) => {
              const { iD, images } = data;
              const url = images[0].url;
              return (
                <div key={index} className={style.createdColor}>
                  <p>{iD}</p>
                  <Image
                    width={300}
                    height={200}
                    src={url || images[0]}
                    alt={"create color"}
                  />
                  <svg onClick={() => funcDeleteImageSet(index, url)}>
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

          <label className={style.label}>
            Difference: <input ref={multipleInput} type="text" />
          </label>
          <div id={style.createColorSet} className={style.createdColors}>
            {images.map((img, index) => (
              <div className={style.createdColor} key={index}>
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
            Create Image Set:
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
              style={
                imagesLength > 0
                  ? { visibility: "visible", opacity: 9 }
                  : { visibility: "hidden", opacity: 0 }
              }
              onClick={addImgFunction}
              className={style.addImg}
              type="button"
            >
              Update Img
            </button>
          </label>
        </div>
      ) : null}
      {variants[0]?.vD ? (
        <div className={style.variants}>
          <span className={style.span}>Variants: </span>
          {variants.map((data, index) => (
            <div
              className={style.div}
              style={{
                boxShadow: `inset 0px 0px 5px 0px ${
                  index === editVariantIndex ? "rgb(48 211 48)" : "white"
                }`,
              }}
              key={index}
            >
              <p onClick={() => funcOpenContainer3(index)}>{data.vD}</p>
              {index > 0 ? (
                <svg
                  onClick={() => funcVariantOrder(index, "left")}
                  viewBox="0 0 512 512"
                  className={style.leftArrow}
                >
                  <path
                    d="m327.3 98.9-2.1 1.8-156.5 136c-5.3 4.6-8.6 11.5-8.6 19.2 0 7.7 3.4 14.6 8.6 19.2L324.9 411l2.6 2.3c2.5 1.7 5.5 2.7 8.7 2.7 8.7 0 15.8-7.4 15.8-16.6V112.6c0-9.2-7.1-16.6-15.8-16.6-3.3 0-6.4 1.1-8.9 2.9z"
                    fill=" #d3d3d3"
                  ></path>
                </svg>
              ) : null}
              {totalVariant > index + 1 ? (
                <svg
                  className={style.rightArrow}
                  onClick={() => funcVariantOrder(index, "right")}
                  viewBox="0 0 512 512"
                >
                  <path
                    d="m184.7 413.1 2.1-1.8 156.5-136c5.3-4.6 8.6-11.5 8.6-19.2 0-7.7-3.4-14.6-8.6-19.2L187.1 101l-2.6-2.3C182 97 179 96 175.8 96c-8.7 0-15.8 7.4-15.8 16.6v286.8c0 9.2 7.1 16.6 15.8 16.6 3.3 0 6.4-1.1 8.9-2.9z"
                    fill="#d3d3d3"
                  ></path>
                </svg>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {editVariantIndex >= 0 ? null : (
        <label
          id={style.aLife}
          className={style.colorAndVariantType}
          htmlFor="aLife"
        >
          Average life (days) :
          <input
            ref={aLife}
            defaultValue={firstVarVD ? null : firstVarALife}
            type="number"
            placeholder="Max 730 days"
            name="aLife"
            id="aLife"
          />
        </label>
      )}
      {editVariantIndex >= 0
        ? (function () {
            const { vD, options, aLife } = variants[editVariantIndex];
            const totalOption = options.length;
            return (
              <div className={style.editImageSetContainer}>
                <label className={style.colorAndVariantType} htmlFor="aLife">
                  Average life (days) :
                  <input
                    ref={aLifeMultiVar}
                    defaultValue={aLife}
                    type="number"
                    placeholder="Max 730 days"
                    name="aLife"
                    onChange={() => multipleInputChange(vD, aLife)}
                    id="aLife"
                  />
                </label>
                <div className={style.label}>
                  Difference:
                  <input
                    onChange={() => multipleInputChange(vD)}
                    ref={multipleInput}
                    type="text"
                    defaultValue={vD}
                  />
                  <button
                    onClick={funcEditVd}
                    ref={multipleInputBtn}
                    type="button"
                  >
                    Set Name
                  </button>
                </div>
                <div id={style.options} className={style.variants}>
                  <span className={style.span}>Options:</span>
                  {options.map((data, index) => (
                    <div className={style.div} key={index}>
                      <svg onClick={() => funcDeleteVariantOption(index)}>
                        <path
                          fill="#FF0000"
                          d="M7 18a1 1 0 0 1-.707-1.707l10-10a1 1 0 0 1 1.414 1.414l-10 10A.997.997 0 0 1 7 18Z"
                        ></path>
                        <path
                          fill="#FF0000"
                          d="M17 18a.997.997 0 0 1-.707-.293l-10-10a1 1 0 0 1 1.414-1.414l10 10A1 1 0 0 1 17 18Z"
                        ></path>
                      </svg>
                      <p>{data.optID}</p>
                      {totalOption > 1 && index > 0 ? (
                        <svg
                          onClick={() =>
                            funcEditVariantOptionsOrder(index, "left")
                          }
                          viewBox="0 0 512 512"
                          className={style.leftArrow}
                        >
                          <path
                            d="m327.3 98.9-2.1 1.8-156.5 136c-5.3 4.6-8.6 11.5-8.6 19.2 0 7.7 3.4 14.6 8.6 19.2L324.9 411l2.6 2.3c2.5 1.7 5.5 2.7 8.7 2.7 8.7 0 15.8-7.4 15.8-16.6V112.6c0-9.2-7.1-16.6-15.8-16.6-3.3 0-6.4 1.1-8.9 2.9z"
                            fill=" #d3d3d3"
                          ></path>
                        </svg>
                      ) : null}
                      {totalOption > 1 && totalOption > index + 1 ? (
                        <svg
                          className={style.rightArrow}
                          onClick={() =>
                            funcEditVariantOptionsOrder(index, "right")
                          }
                          viewBox="0 0 512 512"
                        >
                          <path
                            d="m184.7 413.1 2.1-1.8 156.5-136c5.3-4.6 8.6-11.5 8.6-19.2 0-7.7-3.4-14.6-8.6-19.2L187.1 101l-2.6-2.3C182 97 179 96 175.8 96c-8.7 0-15.8 7.4-15.8 16.6v286.8c0 9.2 7.1 16.6 15.8 16.6 3.3 0 6.4-1.1 8.9-2.9z"
                            fill="#d3d3d3"
                          ></path>
                        </svg>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()
        : null}
      <label className={style.selectContainer}>
        Multiple Variants and Options
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
        <input
          defaultValue={oldVariantDifference}
          type="text"
          ref={variantDInput}
        />
      </label>

      {openMultipleVariant ? (
        <div className={style.multipleVariantsDiv}>
          <p className={style.creationType}>Create multiple variant</p>

          <div className={style.createdVariants}>
            {variants.map((obj, index) => {
              const { vD, options } = obj;
              return (
                <div key={index} className={style.variant}>
                  <span>
                    {index + 1}: {vD}
                  </span>
                  {options?.length > 0 ? (
                    <div>
                      <p>option:</p>
                      {options.map((color, index) => (
                        <span key={index}>{color.optID}</span>
                      ))}
                    </div>
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
                <div key={index} className={style.createdColor}>
                  <Image
                    style={{
                      borderColor: varianImageSets.includes(iD)
                        ? "#0cff0c"
                        : "black",
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
                    width={300}
                    height={200}
                    src={images[0].url || images[0]}
                    alt={"create color"}
                  />
                  <p>{iD}</p>
                </div>
              );
            })}
          </div>
          <div className={style.label}>
            Difference:{" "}
            <input
              onChange={() => {
                if (multipleInput.current.value.trim().length > 0) {
                  multipleInputBtn.current.style.opacity = 9;
                  multipleInputBtn.current.style.visibility = "visible";
                } else {
                  multipleInputBtn.current.style.opacity = 0;
                  setTimeout(() => {
                    multipleInputBtn.current.style.visibility = "hidden";
                  }, 1000);
                }
              }}
              ref={multipleInput}
              type="text"
            />
            <button
              ref={multipleInputBtn}
              type="button"
              onClick={varianAndImageSetFunc}
            >
              Update / Create
            </button>
          </div>
        </div>
      ) : null}
      {totalVariant > 0 && firstVarVD ? (
        <div id={style.varDes} className={style.variants}>
          <p>Var KVD:</p>
          {variants.map((data, index) => (
            <span
              className={style.div}
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
              name="varKVD"
            />
          ))}
        </div>
      ) : null}
      <button onClick={updateProduct} className={style.submitBtn} type="submit">
        Update Product
      </button>
    </div>
  );
};

export default UpdateV;
