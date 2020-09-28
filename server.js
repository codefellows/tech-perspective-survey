"use strict";

// dependancies and global variables
require("dotenv").config();
require("ejs");
const cors = require("cors");
const PORT = process.env.PORT;
const express = require("express");
const superagent = require("superagent");
const pg = require("pg");
const methodOverride = require("method-override");
const app = express();
// const dataBaseUrl = process.env.DATABASE_URL;
// const client = new pg.Client(dataBaseUrl);
// client.on("error", (error) => {
//   console.log(error);
// });

//app
app.use(cors());
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", renderHomePage);

function renderHomePage(request, response) {
  response.render("pages/index");
}

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
