import React from "react";
import style from "./newProduct.module.css";
import NewProductComponent from "./newProduct";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import jwt from "jsonwebtoken";
export const generateMetadata = () => {
  return {
    title: "Create Product",
  };
};

function verifyToken(value) {
  try {
    const decoded = jwt
      .verify(value, process.env.JWT_SECRET_CODE)
      .role.includes("Product Inventory Manager");
    return decoded;
  } catch {
    return null;
  }
}
const NewProduct = () => {
  const cookieStore = cookies();
  const value = cookieStore.get(process.env.COOKIE_TOKEN_NAME)?.value;

  const productInventoryManager = verifyToken(value);

  if (!value || !productInventoryManager) {
    notFound();
  }
  return (
    <div style={{ backgroundColor: "black" }} className={style.mainContainer}>
      <NewProductComponent token={value} />
    </div>
  );
};

export default NewProduct;
