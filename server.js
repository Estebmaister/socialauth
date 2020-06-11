"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const session = require("express-session");
const mongoClient = require("mongodb").MongoClient;
const passport = require("passport");
const config = require("./config.js");

const app = express();

fccTesting(app); //For FCC testing purposes

app.use("/public", express.static(process.cwd() + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "pug");

mongoClient.connect(
  config.MONGO_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err, client) => {
    if (err) return console.log("Database error: " + err);
    const db = client.db("test");
    console.log("Successful database connection to: " + db.s.namespace);

    app.use(
      session({
        secret: config.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
      })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect("/");
    }

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
      db.collection("socialusers").findOne({ id: id }, (err, doc) => {
        done(null, doc);
      });
    });

    /*
     *  ADD YOUR CODE BELOW
     */

    /*
     *  ADD YOUR CODE ABOVE
     */

    app.route("/").get((req, res) => {
      res.render("pug", { showLogin: false });
    });

    app.route("/profile").get(ensureAuthenticated, (req, res) => {
      res.render(process.cwd() + "/views/pug/profile", { user: req.user });
    });

    app.route("/logout").get((req, res) => {
      req.logout();
      res.redirect("/");
    });

    app.use((req, res, next) => {
      res.status(404).type("text").send("Not Found");
    });

    const listener = app.listen(config.PORT || 3001, "localhost", () => {
      const { address, port } = listener.address();
      console.log(`Server is listening at http://${address}:${port}`);
    });
  }
);
