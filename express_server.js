var cookieParser = require('cookie-parser')
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },

  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  return Math.random().toString(36).substring(7);
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// URL PAGE //

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    // username: req.cookies["username"],
    user: req.cookies['user_id']
  };
  res.render("urls_index", templateVars);
});


// NEW URL //
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    // username: req.cookies["username"],
    user: req.cookies['user_id']
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  // console.log(req.body);
  longURLString = req.body.longURL;
  urlDatabase[shortURL] = longURLString;
  res.redirect(`/urls/${shortURL}`);
});


// SHORT URL //
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    // username: req.cookies["username"],
    user: req.cookies['user_id']
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  let newtemplateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    // username: req.cookies["username"],
    user: req.cookies['user_id']
  };
  res.render("urls_show", newtemplateVars);
});

// REDIRECT TO LONG URL //

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// REDIRECT WHEN DELETED //

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


// LOGIN //

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = {
    // username: req.cookies["username"],
    user: req.cookies['user_id']
  }
  res.render("login", templateVars);
  res.redirect("/urls");
});

// LOGOUT //

app.post("/logout", (req, res) => {
  // res.clearCookie('username');
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// REGISTER //

app.get('/register', (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],
    user: req.cookies['user_id']
  };
  res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();


  if (password === '' || email === '') {
    return res.status(400).send('Password or Email Is Blank!');
  }

  users[id] = {
    id,
    email,
    password
  }

  for (let user in users) {
    if (users[user].email = email) {
      return res.status(400).send('Email already exist.');
    }
  }

  res.cookie("user_id", id);
  res.redirect("/urls");
});