"use strict";

require("dotenv").config();

const SESSION_SECRET = process.env.SESSION_SECRET;
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL =
  "https://socialauth-esteb.glitch.me/auth/github/callback";

module.exports = {
  SESSION_SECRET,
  MONGO_URI,
  PORT,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  CALLBACK_URL,
};
