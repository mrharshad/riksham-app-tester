export async function POST(req) {
  try {
    let { category } = await req.json();

    const requiredDes = {
      "Face Care": {
        tOfPS: ["Face Wash", "Face Cream", "Face Scrub"],
        brands: [
          "The Body Shop",
          "Neutrogena",
          "L'Oreal",
          "Himalaya Herbals",
          "Cetaphil",
          "Clinique",
          "Clean & Clear",
          "Nivea",
          "Garnier",
          "Olay",
          "Ponds",
          "Kiehl's",
          "Forest Essentials",
          "Lotus Herbals",
          "Aveeno",
        ],
        keyValueD: {
          common: ["Skin Type", "Net Quantity", "Age range"],
          "Face Cream": ["test 1", "test 2"],
        },
        aInfo: {
          common: ["Country of Origin", "Maximum Use", "Container Type"],
        },
        certificate: {
          common: [
            "Bureau of Indian Standards (BIS)",
            "Drug Controller General of India (DCGI)",
          ],
        },
      },
      Cricket: {
        tOfPS: ["Bat", "Ball", "Stump", "Gloves"],
        brands: ["Adidas", "Puma"],
        keyValueD: {
          common: ["Material", "Net Quantity", "Age range"],
        },
        aInfo: {
          common: ["Country of Origin", "Maximum Use", "Container Type"],
        },
        certificate: {
          common: ["Drug Controller General of India (DCGI)"],
        },
      },
      Badminton: {
        tOfPS: ["Bat", "Ball", "Stump", "Gloves"],
        brands: ["Adidas", "Puma"],
        keyValueD: {
          common: ["Material", "Net Quantity", "Age range"],
        },
        aInfo: {
          common: ["Country of Origin", "Maximum Use", "Container Type"],
        },
        certificate: {
          common: [],
        },
      },
      Football: {
        tOfPS: ["Football Shoes", "Football", "Football Gloves"],
        brands: ["Adidas", "Puma"],
        keyValueD: {
          common: ["Material", "Net Quantity", "Age range"],
        },
        aInfo: {
          common: ["Country of Origin", "Maximum Use", "Container Type"],
        },
        certificate: {
          common: [],
        },
      },
    };

    const data = requiredDes[category];
    console.log(data);
    if (!data) {
      throw new Error("category not found");
    }
    data.category = category;
    return new Response(
      JSON.stringify({
        success: true,
        message: "Data Send Successfully",
        data,
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: err.message,
      }),
      {
        status: 200,
      }
    );
  }
}
