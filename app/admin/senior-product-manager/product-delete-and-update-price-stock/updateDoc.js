"use client";
import style from "./Update.module.css";
const UpdateDoc = ({
  setManage,
  token,
  product,
  useRef,
  useState,
  Image,
  removedProduct,
  setWait,
  states,
  selectedState,
  selectedStateFunc,
  allDistricts,
}) => {
  if (!product) {
    return;
  }
  const {
    createdAt,
    modifiedStock,
    name,
    payType: oldPayment,
    variants: oldVariants,
    packaging: oldPackagingCharge,
    shipping: oldShippingCharge,
    variantD,
    variantPD: oldVariantPriceDif,
    imgSetPD: oldImgSetPriceDif,
    imageSetD,
    everyPC: oldEveryProductCharge,
    imageSets,
    _id,
  } = product;
  const [variants, setVariants] = useState(oldVariants);
  const [payType, setPayment] = useState(oldPayment || []);
  const [variantIndex, setVariantIndex] = useState(0);
  const [variantPriceDif, setVariantPriceSame] = useState(oldVariantPriceDif);
  const [imgSetPD, setImgSetPD] = useState(oldImgSetPriceDif);
  const [variantColorName, setVariantColorName] = useState(false);
  const [changedDocument, setChangedDocument] = useState(false);

  const districtInput = useRef();
  const stockInput = useRef();
  const [newLocated, setNewLocated] = useState();
  const shippingCharge = useRef();
  const packagingCharge = useRef();
  const everyProductCharge = useRef();
  const modifiedDocumentFunc = () => {
    if (!changedDocument) {
      setChangedDocument(true);
    }
  };
  function closeColorStocks() {
    if (variantColorName) {
      setVariantColorName(false);
    }
  }
  const paymentOptionsSelect = (event) => {
    modifiedDocumentFunc();
    const value = event.target.value;
    setPayment((previous) => {
      if (previous.includes(value)) {
        return previous.filter((data) => data !== value);
      } else {
        return [...previous, value];
      }
    });
  };

  const priceChanges = (event) => {
    modifiedDocumentFunc();
    const { name, value } = event.target;
    const [inputName, setName] = name.split(":");
    setVariants((previous) => {
      const options = previous[variantIndex].options;
      const newOptions = options.map((opt) => {
        if (opt.optID === setName) {
          opt[inputName] = Number(value);
        }
        return opt;
      });
      previous[variantIndex].options = newOptions;
      return previous;
    });
  };

  const deleteVariant = (index, difference) => {
    const variantsCount = variants.length;

    if (variantsCount === 1) {
      return alert("Must have at least 1 variant");
    }
    if (variantsCount - 1 === index) {
      setVariantIndex(0);
    }
    closeColorStocks();
    modifiedDocumentFunc();
    setVariants((previous) => previous.filter((obj) => obj.vD != difference));
  };

  const deleteVariantColor = (name) => {
    const newOptions = variants[variantIndex].options;
    if (newOptions.length === 1) {
      return alert("Any variant must have at least 1 color");
    }
    setVariants((previous) => {
      previous[variantIndex].options = newOptions.filter(
        (opt) => opt.optID !== name
      );
      return [...previous];
    });
    modifiedDocumentFunc();
  };

  const deleteStateStock = (state) => {
    modifiedDocumentFunc();
    setNewLocated((previous) =>
      previous.filter((stateObj) => stateObj.s !== state)
    );
  };
  const deleteDistrictStock = (districtName, stateIndex, state) => {
    let districts = newLocated[stateIndex].d;
    if (districts.length === 1) {
      deleteStateStock(state);
    } else {
      newLocated[stateIndex].d = districts.filter(
        (district) => district.dN !== districtName
      );
    }
    modifiedDocumentFunc();
    setNewLocated((pre) => {
      return [...pre];
    });
  };
  const updateDocument = async () => {
    const packagingChargeValue = +packagingCharge.current.value;
    const shippingChargeValue = +shippingCharge.current.value;
    const everyProductChargeValue = everyProductCharge.current.checked;
    if (
      !shippingChargeValue &&
      !packagingChargeValue &&
      everyProductChargeValue
    ) {
      return alert("please double check the charges");
    }
    if (shippingChargeValue < 0 || packagingChargeValue < 0) {
      return alert("please double check the charges");
    }
    if (payType.length === 0) {
      return alert("Please select the payment method of the product");
    }
    try {
      let deletingSelectedImg = [...imageSets];
      setWait(true);
      function checkPrices(name, currentPrice, purchasedPrice, index, mrp) {
        const err = `There is a problem with the price of - ${
          index + 1
        }: ${name}- color.`;
        if (
          purchasedPrice > currentPrice ||
          purchasedPrice < 1 ||
          currentPrice < 1 ||
          !currentPrice ||
          !purchasedPrice
        ) {
          throw new Error(err);
        }
        if (mrp) {
          if (mrp < currentPrice || purchasedPrice > mrp) {
            throw new Error(err);
          }
        }
      }

      function checkDeleteImage(name) {
        return deletingSelectedImg.filter((imgSet) => imgSet.iD !== name);
      }
      if (variantPriceDif && !imgSetPD) {
        variants.map((variant, index) => {
          const {
            current: currentPriceV,
            mrp: mrpV,
            purchased: purchasedPriceV,
          } = variant.options[0];
          const options = variant.options.map((color, colorIndex) => {
            const { current, purchased, mrp, optID, loc } = color;
            deletingSelectedImg = checkDeleteImage(optID);
            if (!loc.length > 0) {
              throw new Error("please check store stocks");
            }
            if (colorIndex === 0) {
              checkPrices(optID, current, purchased, index, mrp);
              return color;
            } else {
              return {
                optID,
                loc,
                current: currentPriceV,
                mrp: mrpV,
                purchased: purchasedPriceV,
              };
            }
          });
          variant.options = options;
          return variant;
        });
      } else if (!variantPriceDif && imgSetPD) {
        const firstVariantOption = variants[0].options;
        variants.map((variant, index) => {
          const options = variant.options.map((color) => {
            const { current, purchased, mrp, optID, loc } = color;
            deletingSelectedImg = checkDeleteImage(optID);
            if (!loc.length > 0) {
              throw new Error("please check store stocks");
            }
            if (index === 0) {
              checkPrices(optID, current, purchased, mrp, index);
              return color;
            } else {
              const findImgSet = firstVariantOption.find(
                (colorF) => colorF.optID === optID
              );
              if (!findImgSet) {
                throw new Error(
                  `${variantD}: ${variant.vD} - has a problem. the ${optID} color product is not available in first variant`
                );
              } else {
                const {
                  current: currentPriceV,
                  mrp: mrpV,
                  purchased: purchasedPriceV,
                } = findImgSet;
                return {
                  optID,
                  loc,
                  mrp: mrpV,
                  current: currentPriceV,
                  purchased: purchasedPriceV,
                };
              }
            }
          });
          variant.options = options;
          return variant;
        });
      } else if (variantPriceDif && imgSetPD) {
        variants.map((variant, index) => {
          variant.options.forEach((opt) => {
            const { current, purchased, mrp, optID, loc } = opt;
            if (!loc.length > 0) {
              throw new Error("please check store stocks");
            }
            deletingSelectedImg = checkDeleteImage(optID);
            checkPrices(optID, current, purchased, index, mrp);
          });
          return variant;
        });
      } else {
        const {
          current: currentPriceV,
          mrp: mrpV,
          purchased: purchasedPriceV,
        } = variants[0].options[0];
        variants.map((variant, index) => {
          const options = variant.options.map((opt, colorIndex) => {
            const { current, purchased, mrp, optID, loc } = opt;
            if (!loc.length > 0) {
              throw new Error("please check store stocks");
            }
            deletingSelectedImg = checkDeleteImage(optID);
            if (index === 0 && colorIndex === 0) {
              checkPrices(optID, current, purchased, index, mrp);
              return opt;
            } else {
              return {
                optID,
                loc,
                mrp: mrpV,
                current: currentPriceV,
                purchased: purchasedPriceV,
              };
            }
          });
          variant.options = options;
          return variant;
        });
      }
      const public_ids = [];
      const imgSetName = [];
      if (deletingSelectedImg.length > 0) {
        for (let imgSet of deletingSelectedImg) {
          const { iD, images } = imgSet;
          imgSetName.push(iD);
          for (let image of images) {
            public_ids.push(image.public_id);
          }
          imgSet.images.public_id;
        }
      }
      const productData = await fetch(
        "/api/admin/senior-product-manager/update-price-and-stock",
        {
          method: "PUT",
          body: JSON.stringify({
            _id,
            public_ids,
            token,
            variants,
            name,
            payType,
            imageSets: imageSets.filter((imgSet) => {
              if (!imgSetName.includes(imgSet.iD)) {
                return imgSet;
              }
            }),
            packaging: packagingChargeValue,
            shipping: shippingChargeValue,
            variantPD: variantPriceDif,
            imgSetPD: imgSetPD,
            everyPC: everyProductChargeValue,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await productData.json();
      const { success, message } = result;
      if (success) {
        alert(message);
        removedProduct(name);
        setManage(false);
        setWait(false);
      } else {
        throw new Error(message);
      }
    } catch (error) {
      setWait(false);
      setChangedDocument(false);
      alert(error.message);
    }
  };
  return (
    <div className={style.stockPrice}>
      <p
        onClick={() => {
          removedProduct(name);
          setManage(false);
        }}
        className={style.closeBtn}
      >
        <span className={style.one}></span>
        <span className={style.two}></span>
      </p>
      <p className={style.name}>{name} ::</p>
      <label className={style.packagingCharge}>
        Packaging Charge:{" "}
        <input
          ref={packagingCharge}
          defaultValue={oldPackagingCharge}
          type="number"
        />
      </label>
      <label className={style.shippingCharge}>
        Shipping Charge:{" "}
        <input
          ref={shippingCharge}
          defaultValue={oldShippingCharge}
          type="number"
        />
      </label>
      <label className={style.everyProduct}>
        Will the shipping and packaging charges increase with the quantity of
        the product:{" "}
        <input
          ref={everyProductCharge}
          defaultChecked={oldEveryProductCharge || false}
          type="checkbox"
        />
      </label>
      <div className={style.payment}>
        <button
          style={{
            border: payType.includes("Full Payment")
              ? "1px solid white"
              : "none",
          }}
          value="Full Payment"
          onClick={paymentOptionsSelect}
          type="checkbox"
        >
          Full Payment
        </button>

        <button
          style={{
            border: payType.includes("Just Delivery / Packaging Charge")
              ? "1px solid white"
              : "none",
          }}
          value="Just Delivery / Packaging Charge"
          onClick={paymentOptionsSelect}
          type="checkbox"
        >
          Just Delivery / Packaging Charge
        </button>

        <button
          style={{
            border: payType.includes("Cash on Delivery / Pay on Delivery")
              ? "1px solid white"
              : "none",
          }}
          value="Cash on Delivery / Pay on Delivery"
          onClick={paymentOptionsSelect}
          type="checkbox"
        >
          Cash on Delivery / Pay on Delivery
        </button>
      </div>
      {variantD ? (
        <label className={style.everyProduct}>
          There is a price difference for all variants of the product:
          <button
            style={{ background: variantPriceDif ? "aqua" : "red" }}
            onClick={(event) => {
              modifiedDocumentFunc();
              const style = event.target.style;
              if (variantIndex) {
                setVariantIndex(false);
                setTimeout(() => setVariantIndex(0), 1);
              }
              closeColorStocks();
              setVariantPriceSame((previous) => {
                if (previous) {
                  style.backgroundColor = "red";
                  return false;
                } else {
                  style.backgroundColor = "aqua";
                  return true;
                }
              });
            }}
          ></button>
        </label>
      ) : null}
      {typeof variantIndex === "number"
        ? (function () {
            const { vD, options } = variants[variantIndex];

            return (
              <div className={style.variantInfo}>
                {variantD ? (
                  <p className={style.heading}>
                    Update
                    <span>{`${variantD}: ${vD}`}</span>
                    Price And Stock
                  </p>
                ) : null}
                <label className={style.everyProduct}>
                  The difference in prices for all the colors of the product is:
                  <button
                    style={{ backgroundColor: imgSetPD ? "aqua" : "red" }}
                    onClick={(event) => {
                      modifiedDocumentFunc();
                      event.preventDefault();
                      setImgSetPD((previous) => {
                        if (!previous) {
                          event.target.style.backgroundColor = "aqua";
                          return true;
                        } else {
                          event.target.style.backgroundColor = "red";
                          return false;
                        }
                      });
                    }}
                  ></button>
                </label>

                {variantColorName && newLocated
                  ? (function () {
                      const stockChangeFunc = (event) => {
                        const { name, value } = event.target;
                        const inputValue = +value;
                        if (inputValue <= 0) {
                          event.target.value = 1;
                          return alert("Can't give less than 1 stock");
                        }
                        const [stateIndex, districtIndex] = name.split(":");

                        setNewLocated((previous) => {
                          previous[stateIndex].d[districtIndex].qty =
                            inputValue;
                          return previous;
                        });
                      };

                      const createStoreStockFunc = (event) => {
                        const stockInputValue = +stockInput.current.value;

                        if (stockInputValue < 1) {
                          return alert("Can't give less than 1 stock");
                        }
                        const districtInputValue = districtInput.current.value;
                        if (newLocated.length > 0) {
                          let findState = false;
                          let findDistrict = false;
                          newLocated.forEach((staObj, staIndex) => {
                            const { s, d } = staObj;
                            if (s === selectedState) {
                              findState = staIndex;
                            }
                            d.forEach((disObj) => {
                              if (disObj.dN === districtInputValue) {
                                findDistrict = true;
                              }
                            });
                          });

                          if (findDistrict) {
                            return alert(
                              `Stock available in -${districtInputValue}- district shop`
                            );
                          }
                          if ((findState || findState === 0) && !findDistrict) {
                            newLocated[findState].d.push({
                              dN: districtInputValue,
                              qty: stockInputValue,
                            });
                          } else {
                            newLocated.push({
                              s: selectedState,
                              d: [
                                {
                                  dN: districtInputValue,
                                  qty: stockInputValue,
                                },
                              ],
                            });
                          }

                          setNewLocated([...newLocated]);
                        } else {
                          setNewLocated([
                            {
                              s: selectedState,
                              d: [
                                {
                                  dN: districtInputValue,
                                  qty: stockInputValue,
                                },
                              ],
                            },
                          ]);
                        }
                      };
                      return (
                        <div className={style.stockManage}>
                          <p className={style.colorName}>
                            <span>{variantColorName}</span> : {imageSetD} stocks
                          </p>

                          {newLocated.map((states, stateIndex) => {
                            const { s, d } = states;
                            return (
                              <div className={style.state} key={s}>
                                <p
                                  onClick={() => deleteStateStock(s)}
                                  className={style.delete}
                                >
                                  Delete State
                                </p>
                                <p className={style.stateName}>State : {s} </p>
                                {d.map((districts, districtIndex) => {
                                  const { dN, qty } = districts;
                                  return (
                                    <div className={style.district} key={dN}>
                                      <li className={style.index}></li>
                                      <span>{dN}</span>
                                      <input
                                        name={`${stateIndex}:${districtIndex}`}
                                        onChange={stockChangeFunc}
                                        className={style.stock}
                                        type="number"
                                        defaultValue={qty}
                                      />
                                      <p
                                        onClick={() =>
                                          deleteDistrictStock(dN, stateIndex, s)
                                        }
                                        className={style.closeBtn}
                                      >
                                        <span className={style.one}></span>
                                        <span className={style.two}></span>
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}

                          <div className={style.newStoreStock}>
                            <select
                              defaultValue={selectedState}
                              onChange={selectedStateFunc}
                              className={style.selectState}
                            >
                              {states.map((state, index) => (
                                <option key={index} value={state}>
                                  {state}
                                </option>
                              ))}
                            </select>
                            <select
                              defaultValue="Raipur"
                              ref={districtInput}
                              className={style.selectDistrict}
                            >
                              {allDistricts.map((district, index) => (
                                <option key={index} value={district}>
                                  {district}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              placeholder="stock..."
                              ref={stockInput}
                            />
                            <button
                              onClick={createStoreStockFunc}
                              type="button"
                            >
                              Create
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              if (newLocated.length === 0) {
                                return alert(
                                  "Must have stores in at least 1 district"
                                );
                              }
                              setVariants((previous) => {
                                const options = previous[variantIndex].options;
                                const newColors = options.map((opt) => {
                                  if (opt.optID === variantColorName) {
                                    opt.loc = newLocated;
                                  }
                                  return opt;
                                });
                                previous[variantIndex].options = newColors;
                                return previous;
                              });
                              modifiedDocumentFunc();
                              closeColorStocks();
                              setNewLocated();
                            }}
                            className={style.updateStockBtn}
                          >
                            Update Stocks
                          </button>
                        </div>
                      );
                    })()
                  : null}
                <div className={style.variantUpdate}>
                  {options.map((obj, index) => {
                    const { optID, current, mrp, purchased, loc } = obj;
                    const firstImgUrl = imageSets.find(
                      (obj) => obj.iD === optID
                    ).images[0].url;
                    return (
                      <div key={index} className={style.variantColor}>
                        <p
                          onClick={() => deleteVariantColor(optID)}
                          className={style.closeBtn}
                        >
                          <span className={style.one}></span>
                          <span className={style.two}></span>
                        </p>
                        <Image
                          className={style.img}
                          src={firstImgUrl}
                          alt="product color image"
                          height={150}
                          width={150}
                        />
                        <span className={style.colorName}>{optID}</span>
                        {(!imgSetPD && !variantPriceDif && variantIndex > 0) ||
                        (!variantPriceDif && imgSetPD && variantIndex > 0) ||
                        (variantPriceDif && !imgSetPD && index > 0) ||
                        (!variantPriceDif && !imgSetPD && index > 0) ? null : (
                          <div className={style.prices}>
                            <label>
                              MRP:
                              <input
                                defaultValue={mrp}
                                onChange={priceChanges}
                                name={`mrp:${optID}`}
                                type="number"
                              />
                            </label>
                            <label>
                              Purchased:
                              <input
                                defaultValue={purchased}
                                onChange={priceChanges}
                                name={`purchased:${optID}`}
                                type="number"
                              />
                            </label>
                            <label>
                              Current:
                              <input
                                defaultValue={current}
                                onChange={priceChanges}
                                name={`current:${optID}`}
                                type="number"
                              />
                            </label>
                          </div>
                        )}

                        <button
                          style={{
                            border: `2px solid ${
                              variantColorName === optID ? "#14ffef" : "gray"
                            }`,
                          }}
                          type="button"
                          onClick={(even) =>
                            setVariantColorName((previous) => {
                              if (previous === optID) {
                                return false;
                              } else {
                                if (newLocated) {
                                  setNewLocated();
                                }

                                setTimeout(() => setNewLocated(loc), 1);

                                return optID;
                              }
                            })
                          }
                        >
                          Stocks
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()
        : null}
      {variantD
        ? variants.map((obj, index) => {
            const { vD } = obj;
            return (
              <div
                key={index}
                className={style.allVariants}
                style={{
                  background:
                    variantIndex === index
                      ? "linear-gradient(to right bottom, rgb(0, 0, 0), rgb(108 168 172))"
                      : "linear-gradient(to left top, #000000, #626262)",
                }}
              >
                <span className={style.index}>{index + 1}</span>
                {variantD ? (
                  <span
                    onClick={() => {
                      closeColorStocks();
                      const typeOfVariantIndex =
                        typeof variantIndex === "number";
                      if (typeOfVariantIndex) {
                        setTimeout(() => {
                          setVariantIndex(index);
                        }, 1);
                      }
                      setVariantIndex(typeOfVariantIndex ? false : index);
                    }}
                    key={index}
                    className={style.vD}
                  >{`${variantD}: ${vD}`}</span>
                ) : null}
                <p
                  onClick={() => deleteVariant(index, vD)}
                  className={style.closeBtn}
                >
                  <span className={style.one}></span>
                  <span className={style.two}></span>
                </p>
              </div>
            );
          })
        : null}
      {changedDocument ? (
        <div className={style.updateDocumentCover}>
          <button
            onClick={updateDocument}
            className={style.updateDocument}
            type="button"
          >
            Update Document
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default UpdateDoc;
