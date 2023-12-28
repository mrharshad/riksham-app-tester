import mongoose from "mongoose";
// same code -
function dbConnect() {
  mongoose
    .connect(
      "mongodb+srv://riksham:Riksham17022000@cluster0.jnegnqs.mongodb.net/ecommerce?retryWrites=true&w=majority"
      // "mongodb+srv://Restapi:restapithapa@thapaapi.24xyfkg.mongodb.net/ThapaApi?retryWrites=true&w=majority"
    )
    .then(() => {
      console.log(`server is connected port: ${mongoose.connection.host}`);
    })
    .catch((err) =>
      console.log(`server in not connected for data base: ${err}`)
    );
}

export default dbConnect;
