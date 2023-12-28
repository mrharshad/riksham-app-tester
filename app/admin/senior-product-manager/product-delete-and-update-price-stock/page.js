import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import jwt from "jsonwebtoken";
import ProductUpdateDelete from "./productUpdateDelete";

export const generateMetadata = () => {
  return {
    title: "Product Update / Delete ",
  };
};

function verifyToken(value) {
  try {
    return jwt.verify(value, process.env.JWT_SECRET_CODE);
  } catch {
    return null;
  }
}
const Dashboard = async () => {
  const cookieStore = cookies();
  const value = cookieStore.get(process.env.COOKIE_TOKEN_NAME)?.value;
  const productManager = verifyToken(value);
  const role = productManager?.role;
  const seniorProductManager = role?.includes("Senior Product Manager");
  if (!value || !productManager || !seniorProductManager) {
    notFound();
  }

  return <ProductUpdateDelete token={value} />;
};

export default Dashboard;
