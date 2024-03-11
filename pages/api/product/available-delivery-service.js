export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      throw new Error("Please Change Method");
    }

    const deliveryService = {
      492011: "Gudhiyari Raipur Chhattisgarh",
      492001: "Ram Nagar  Raipur Chhattisgarh",
    };
    const location = deliveryService[req.query.pinCode];
    if (!location) {
      throw new Error();
    }
    res.status(200).json({
      success: true,
      message: `Available: ${location}`,
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Delivery service is not available in this pin code",
    });
  }
}
