const mongoose = require("mongoose");
let instance = null;

const connectDB = async () => {
  if (instance) {
    console.log("Reusing existing DB connection (Singleton)");
    return instance;
  }
  try {
    instance = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/vortex");
    console.log("MongoDB Connected Successfully");
    mongoose.connection.on("disconnected", () => { instance = null; });
    return instance;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
