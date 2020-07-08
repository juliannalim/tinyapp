const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(cookieParser())

function generateRandomString() {
  let r = Math.random().toString(36).substring(7)
  return r;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: null,
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: null,
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: null,
    username: req.cookies["username"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let longURL = req.body.longURL;
  //res.send("Ok");
  // generate random short URL (good)
  let shortURL = generateRandomString();
  // add the short URL - long URL key value pair to URL database
  // respond with a redirect to /url/short-url 
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  //let shortURL = req.params.shortURL;
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls/');
});

//TODO: need to fix currently adding not replacing 
app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls`);
});

// app.get("/login", (req, res) => {
//   res.cookie(`/urls`);
// });

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls')
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
});

// Display the register form to the user
app.get('/register', (req, res) => {
  const templateVars = { user: null };
  res.render('register', templateVars);
});

// Catch the submit of the register form
app.post('/register', (req, res) => {
  // Extract the user info from the form
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
});
