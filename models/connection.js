const mongoose = require("mongoose")
const connectionString = process.env.CONNECTION_STRING
//mongodb+srv://<username>:<password>@cluster0.uwgpf8v.mongodb.net/
mongoose.set("strictQuery", true)

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("Successfully connected to the Homematcher Database 🥳 !"))
  .catch((errorMessage) => console.error(errorMessage))