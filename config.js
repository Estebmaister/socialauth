"use strict";

require("dotenv").config();

const SESSION_SECRET = process.env.SESSION_SECRET;
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;

module.exports = {
  SESSION_SECRET,
  MONGO_URI,
  PORT,
};
