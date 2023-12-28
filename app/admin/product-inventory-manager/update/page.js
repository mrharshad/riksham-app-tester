import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import jwt from "jsonwebtoken";
import UpdateProduct from "./productUpdate";
export const generateMetadata = () => {
  return {
    title: "Update Product",
  };
};

function verifyToken(value) {
  try {
    return jwt
      .verify(value, process.env.JWT_SECRET_CODE)
      .role.includes("Product Inventory Manager");
  } catch {
    return null;
  }
}
const Dashboard = () => {
  const cookieStore = cookies();
  const value = cookieStore.get(process.env.COOKIE_TOKEN_NAME)?.value;
  const productInventoryManager = verifyToken(value);
  if (!value || !productInventoryManager) {
    notFound();
  }
  return <UpdateProduct token={value} />;
};

export default Dashboard;
