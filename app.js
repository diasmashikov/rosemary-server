const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

app.use(cors());
app.options("*", cors());

//middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(
  "/public/uploads/categories",
  express.static(__dirname + "/public/uploads/categories")
);
app.use(
  "/public/uploads/products",
  express.static(__dirname + "/public/uploads/products")
);

app.use(errorHandler);

//Routes
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const promotionsRoutes = require("./routes/promotions");
const contactsRoutes = require("./routes/contacts");
const askedQuestionsRoutes = require("./routes/asked-questions");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/promotions`, promotionsRoutes);
app.use(`${api}/contacts`, contactsRoutes);
app.use(`${api}/askedQuestions`, askedQuestionsRoutes);

//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

//Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("server is running http://localhost:3000");
});
