"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const config = require("./config.js");
const passport = require("passport");
const session = require("express-session");
const mongoClient = require("mongodb").MongoClient;
const GitHubStrategy = require("passport-github").Strategy;

const app = express();

fccTesting(app); //For FCC testing purposes

app.use("/public", express.static(process.cwd() + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "pug");

const client = new mongoClient(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
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

  /* _______ Configure Github Strategy _______ */

  passport.use(
    new GitHubStrategy(
      {
        clientID: config.GITHUB_CLIENT_ID,
        clientSecret: config.GITHUB_CLIENT_SECRET,
        callbackURL: config.GITHUB_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        db.collection("socialUsers").findAndModify(
          { githubId: profile.id },
          {},
          {
            $setOnInsert: {
              id: profile.id,
              username: profile.login,
              name: profile.displayName || "John Doe",
              photo: profile.photos[0].value || "",
              email: profile.emails[0].value || "No public email",
              created_on: new Date(),
              provider: profile.provider || "",
            },
            $set: { last_login: new Date() },
            $inc: { login_count: 1 },
          },
          { upsert: true, new: true }, //Insert object if not found, Return new object after modify
          (err, user) => {
            return done(null, user.value);
          }
        );
      }
    )
  );
  app.route("/auth/github").get(passport.authenticate("github"));
  app
    .route("/auth/github/callback")
    .get(
      passport.authenticate("github", { failureRedirect: "/" }),
      (req, res) => res.redirect("/profile")
    );

  /* _______ ROUTES _______ */

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
});
