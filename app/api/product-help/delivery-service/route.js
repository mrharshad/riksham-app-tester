export async function POST(req) {
  // apply pages -/product?k
  const { pinCode } = await req.json();
  const pinCodes = {
    492011: "Gudhiyari Raipur Chhattisgarh",
    492009: "Ram Nagar Raipur Chhattisgarh",
  };
  const findPinCode = pinCodes[pinCode];
  return new Response(
    JSON.stringify({
      success: findPinCode ? true : false,
      message: findPinCode
        ? `${findPinCode}:`
        : "Delivery service in this pin code",
    }),
    {
      status: 200,
    }
  );
}
