const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./config/config.env" });
const connectDB = require("./config/db");
// const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

connectDB();

const PORT = process.env.PORT || 3000;

app.use("/api/v1/stores", require("./routes/storeRouter"));
app.use("/api/v1/users", require("./routes/userRouter"));

app.listen(PORT, () => {
    console.log(`App listening on http://localhost:${PORT}`);
});
