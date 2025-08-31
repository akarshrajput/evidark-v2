// utils/connectMongoDB.js
import mongoose from "mongoose";

const connectMongoDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database Connected Successfully!");
  } catch (err) {
    console.error("Database Connection Error:", err);
  }
};

export default connectMongoDB;
