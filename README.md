# Advanced Node and Express - Implementation of Social Authentication

The basic path this kind of authentication will follow in your app is:

1. User clicks a button or link sending them to our route to authenticate using a specific strategy (EG. GitHub)
2. Your route calls `passport.authenticate('github')` which redirects them to GitHub.
3. The page the user lands on, on GitHub, allows them to login if they aren't already. It then asks them to approve access to their profile from our app.
4. The user is then returned to our app at a specific callback url with their profile if they are approved.
5. They are now authenticated and your app should check if it is a returning profile, or save it in your database if it is not.

Strategies with OAuth require you to have at least a _Client ID_ and a _Client Secret_ which is a way for them to verify who the authentication request is coming from and if it is valid. These are obtained from the site you are trying to implement authentication with, such as GitHub, and are unique to your app- **THEY ARE NOT TO BE SHARED** and should never be uploaded to a public repository or written directly in your code. A common practice is to put them in your .env file and reference them like: `process.env.GITHUB_CLIENT_ID`.

For this challenge we're going to use the GitHub strategy.

Obtaining your Client ID and Secret from GitHub is done in your account profile settings under 'developer settings', then ['OAuth applications'](https://github.com/settings/developers). Click 'Register a new application', name your app, paste in the url to your glitch homepage (Not the project code's url), and lastly for the callback url, paste in the same url as the homepage but with '/auth/github/callback' added on. This is where users will be redirected to for us to handle after authenticating on GitHub. Save the returned information as 'GITHUB_CLIENT_ID' and 'GITHUB_CLIENT_SECRET' in your .env file.

On your remixed project, create 2 routes accepting GET requests: /auth/github and /auth/github/callback. The first should only call passport to authenticate 'github' and the second should call passport to authenticate 'github' with a failure redirect to '/' and then if that is successful redirect to '/profile' (similar to our last project).

An example of how '/auth/github/callback' should look is similar to how we handled a normal login in our last project:

```js
app
  .route("/login")
  .post(
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/profile");
    }
  );
```

The last part of setting up your GitHub authentication is to create the strategy itself. For this, you will need to add the dependency of 'passport-github' to your project and require it as GithubStrategy like `const GitHubStrategy = require('passport-github').Strategy;`.

To set up the GitHub strategy, you have to tell passport to use an instantiated GitHubStrategy, which accepts 2 arguments: An object (containing clientID, clientSecret, and callbackURL) and a function to be called when a user is successfully authenticated which we will determine if the user is new and what fields to save initially in the user's database object. This is common across many strategies but some may require more information as outlined in that specific strategy's github README; for example, Google requires a scope as well which determines what kind of information your request is asking returned and asks the user to approve such access. The current strategy we are implementing has its usage outlined [here](https://github.com/jaredhanson/passport-github/), but we're going through it all right here on freeCodeCamp!

Here's how your new strategy should look at this point:

```js
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: /*INSERT CALLBACK URL ENTERED INTO GITHUB HERE*/
},
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    //Database logic here with callback containing our user object
  }
));
```

The final part of the strategy is handling the profile returned from GitHub. We need to load the user's database object if it exists, or create one if it doesn't, and populate the fields from the profile, then return the user's object. GitHub supplies us a unique id within each profile which we can use to search with to serialize the user with (already implemented). Below is an example implementation you can use in your project- it goes within the function that is the second argument for the new strategy, right below the `console.log(profile)`; currently is:

```js
db.collection("socialusers").findAndModify(
  { id: profile.id },
  {},
  {
    $setOnInsert: {
      id: profile.id,
      name: profile.displayName || "John Doe",
      photo: profile.photos[0].value || "",
      email: profile.emails[0].value || "No public email",
      created_on: new Date(),
      provider: profile.provider || "",
    },
    $set: {
      last_login: new Date(),
    },
    $inc: {
      login_count: 1,
    },
  },
  { upsert: true, new: true },
  (err, doc) => {
    return cb(null, doc.value);
  }
);
```

With a findAndModify, it allows you to search for an object and update it, as well as insert the object if it doesn't exist and receive the new object back each time in our callback function. In this example, we always set the last_login as now, we always increment the login_count by 1, and only when we insert a new object(new user) do we populate the majority of the fields. Something to notice also is the use of default values. Sometimes a profile returned won't have all the information filled out or it will have been chosen by the user to remain private; so in this case we have to handle it to prevent an error.
