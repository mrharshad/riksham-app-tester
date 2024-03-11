"use client";
import { useEffect, useState } from "react";
import style from "./remove.module.css";
import { useRouter } from "next/navigation";
import { Wait } from "@/app/Layouts/toastAndWait";
const RemoveProducts = ({ products, token, Fragment }) => {
  const route = useRouter();
  const [selected, setSelected] = useState([]);
  const [wait, setWait] = useState();
  useEffect(() => {
    document.querySelector("#show").checked = true;
  }, [products]);

  const selectNameFunc = (name) => {
    setSelected((previous) => {
      if (previous.includes(name)) {
        return previous.filter((data) => data != name);
      } else {
        return [...previous, name];
      }
    });
  };
  const deleteProduct = async () => {
    if (selected.length === 0) {
      return alert("please select product");
    }
    setWait(true);
    const cart = await fetch(`/api/admin/user/product/delete-cart`, {
      method: "PUT",
      body: JSON.stringify({
        names: selected,
        token,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { success, message } = await cart.json();
    if (success) {
      alert(message);
      route.refresh();
      setSelected([]);
      setWait(false);
    } else {
      setWait(false);
      alert(message);
    }
  };

  return (
    <Fragment>
      {wait ? <Wait /> : null}
      <div className={style.main}>
        <div className={style.container}>
          <p>Products Choose :</p>
          {products.map((name) => (
            <label
              className={style.name}
              onClick={() => selectNameFunc(name)}
              key={name}
            >
              {name}{" "}
              <span
                style={{
                  backgroundColor: (selected || []).includes(name)
                    ? "red"
                    : "white",
                }}
              ></span>
            </label>
          ))}
          <button
            style={
              selected.length > 0 ? { opacity: 9, visibility: "visible" } : null
            }
            onClick={deleteProduct}
            type="button"
          >
            remove
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default RemoveProducts;
