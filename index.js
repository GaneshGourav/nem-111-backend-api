const express = require("express");
const {allRouter} = require("./router/allRoutes")
const app = express();
const PORT = process.env.PORT || 7700;

const connection = require("./db");
require("dotenv").config();
const cors = require("cors");

app.use(express.json());
app.use(cors());

app.use("/users",allRouter)

app.get("/", async (req, res) => {
  try {
    res.status(200).json({ messg: "you're welcome in Blog App" });
  } catch (error) {
    res.status(500).json("Interval server Error");
  }
});

app.listen(PORT, async () => {
  try {
    await connection;
    console.log("connected to dbs");
    console.log(`port is running on ${PORT}`);
  } catch (error) {
    console.log("Internal server Error");
  }
});
