// server.js
const express = require("express");
const connectDB = require("./db"); //  imported correctly
const Person = require("./models/Person");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// connect to MongoDB
connectDB(); //  call the function — don't use `db` here

app.use(bodyParser.json());

const personRoutes = require("./routes/personRoutes");
app.use("/persons", personRoutes);

// Sample route to test the connection
app.get("/", (req, res) => {
  res.send("MongoDB connection successful!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
