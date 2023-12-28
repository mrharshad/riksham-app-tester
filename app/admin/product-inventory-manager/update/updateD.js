import React from "react";
import KeyValue from "../create/keyValue";
import Description from "../create/description";
import style from "./updateD.module.css";

const UpdateD = ({
  product,
  removeProduct,
  token,
  useState,
  useRef,
  setWait,
}) => {
  if (!product) {
    return;
  }
  const {
    _id,
    name: oldName,
    category: oldCategory,
    brand: oldBrand,
    description: oldDescription,
    tOfP: oldTypeOfProduct,
    keyValueD: oldKeyValueDescription,
    aInfo: oldAdditionalInfo,
  } = product;
  let [description, setDescription] = useState(["", ...oldDescription]);
  let [keyValueD, setKeyValueD] = useState([
    ["", ""],
    ...oldKeyValueDescription,
  ]);
  let [aInfo, setAInfo] = useState([["", ""], ...oldAdditionalInfo]);

  let category = useRef();
  let brand = useRef();
  let name = useRef();
  let typeOfProduct = useRef();

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

  const setDescriptionData = (data, oldDec) => {
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
  const deleteDescription = (des, index) => {
    setDescription([]);
    const filtered = description.filter((data) => data !== des);
    setTimeout(() => setDescription(filtered), 1000);
  };

  const updateProduct = async (event) => {
    event.preventDefault();

    function capitalizeWords(str) {
      return str.replace(/\b\w/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase().trim();
      });
    }
    keyValueD = keyValueD.filter((data, index) => index !== 0);
    aInfo = aInfo.filter((data, index) => index !== 0);

    description = description.filter((data, index) => index !== 0);
    if (description.length < 0 || keyValueD.length < 3 || aInfo.length < 0) {
      alert("Please write product description");
    } else {
      setWait(true);
      let categoryCapitalize = category.current.value.toLowerCase().trim();
      let brandCapitalize = brand.current.value.toLowerCase().trim();
      let tOfP = typeOfProduct.current.value.toLowerCase().trim();

      categoryCapitalize = capitalizeWords(categoryCapitalize);
      tOfP = capitalizeWords(tOfP);
      brandCapitalize = capitalizeWords(brandCapitalize);
      let updateProduct = await fetch(
        `/api/admin/product-inventory-manager/update-d`,
        {
          method: "PUT",
          body: JSON.stringify({
            _id,
            name: name.current.value.trim(),
            category: categoryCapitalize,
            brand: brandCapitalize,
            tOfP,
            keyValueD,
            description,
            aInfo,
            token,
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
  };
  return (
    <div className={style.container}>
      <h1>
        Update Descriptions and Info:
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
      <form onSubmit={updateProduct}>
        <label htmlFor="name">Name</label>
        <input
          defaultValue={oldName}
          maxLength={75}
          ref={name}
          required
          id="name"
          type="text"
          placeholder="प्रोडक्ट का नाम लिखें..."
        />
        <label htmlFor="category">Category</label>
        <input
          defaultValue={oldCategory}
          maxLength={25}
          ref={category}
          required
          id="category"
          type="text"
          placeholder="वर्ग लिखे अपने प्रोडक्ट का: Sports / Furniture / Decoration Light / Smartphones / Mobile Accessories ..."
        />
        <label htmlFor="brand">Brand</label>
        <input
          defaultValue={oldBrand}
          maxLength={35}
          ref={brand}
          id="brand"
          type="text"
          placeholder="प्रोडक्ट का ब्रांड:LG / Samsung / Intex / Logitech / Gucci / Nike / Adidas / Puma  ..."
        />
        <label htmlFor="typeOfProduct">Type Of Product</label>
        <input
          defaultValue={oldTypeOfProduct}
          ref={typeOfProduct}
          maxLength={15}
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
              setDescriptionData={setDescriptionData}
              useState={useState}
              useRef={useRef}
              deleteDescription={deleteDescription}
            />
          ))}
        </div>
        <label htmlFor="keyValue">Additional Information</label>
        <div className={style.keyValues}>
          {aInfo.map((data, index) => (
            <KeyValue
              key={index}
              useState={useState}
              keyData={data[0]}
              valueData={data[1]}
              setKeyValueData={setKeyValueData}
              useRef={useRef}
              deleteKeyValue={deleteKeyValue}
            />
          ))}
        </div>

        <button className={style.submitBtn} type="submit">
          Update Product
        </button>
      </form>
    </div>
  );
};

export default UpdateD;
