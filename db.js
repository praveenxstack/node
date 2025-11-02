// db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://praveenyadav2046:RO41hWhB0ybvoFQX@cluster0.rvsxnyk.mongodb.net/?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
