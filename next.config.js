/**
 *  @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir: true,
    // serverActions: true,
    // serverComponentsExternalPackages: ["mongoose"],
  },
  //  iska istemal humne form action vala funtion new work nhi kar raha tha tab kiya tha
  // webpack(config) {
  //   config.experiments = { ...config.experiments, topLevelAwait: true };
  //   return config;
  // },

  // images: {
  //   remotePatterns: [
  //     { protocol: "https", hostname: "'res.cloudinary.com" },
  //     { protocol: "https", hostname: "*.google.com" },
  //   ],
  // },
  images: {
    domains: ["res.cloudinary.com"],
  },
  env: {
    JWT_SECRET_CODE: "harshadkunarsahu170220007771998614",
    JWT_EXPIRE_TIME: "24h",
    PRODUCT_PER_PAGE: 21,
    TYPE_OF_PRODUCTS_PER_PAGE: 12,
    PRODUCT_DELIVERY_INFORMATION_NUMBER: 7771998614,
    PRODUCT_DELIVERY_INFORMATION_EMAIL: "mrharshad2000@gmail.com",
    COOKIE_TOKEN_NAME: "token",
    COOKIE_EXPIRE_TIME: 1,
    SMTP_SERVICE: "gmail",
    SMTP_MAIL: "rikshamsahu@gmail.com",
    SMTP_PASSWORD: "fpalhiuzifubpjuk",
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: 465,

    PROTOCOL_AND_HOST: "https://riksham-app-tester.vercel.app",
    // PROTOCOL_AND_HOST: "http://localhost:3000",

    MONGODB_URL:
      "mongodb+srv://ecommerce:riksham-app-ecommerce-testing@ecommerce.kbtewug.mongodb.net/?retryWrites=true&w=majority",

    REDIS_PORT: 6379,
    REDIS_HOST: "localhost",
    REDIS_PASSWORD: "Mrharshadubuntu",
    PROTOCOL_AND_HOST: "http://localhost:3000",
    CLOUDINARY_CLIENT_NAME: "ddprxcrmx",
    CLOUDINARY_CLIENT_API: "139431242968882",
    CLOUDINARY_CLIENT_SECRET: "ToqHpH3_VFy8kMXTPmYnDS-5oog",
  },
};

module.exports = nextConfig;
