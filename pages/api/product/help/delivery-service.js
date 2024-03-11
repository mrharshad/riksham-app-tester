export default function handler(req, res) {
  // api apply  - product/buy/?
  const { pinCode } = req.query;
  const pinCodes = {
    492011: "Gudhiyari Raipur Chhattisgarh",
    492009: "Ram Nagar Raipur Chhattisgarh",
  };
  const findPinCode = pinCodes[pinCode];
  res.status(200).json({
    success: findPinCode ? true : false,
    message: findPinCode
      ? `${findPinCode}:`
      : "Delivery service in this pin code",
  });
}
