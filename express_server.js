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

const findUser = (email) => {
  for (let id in users) {
    if (email === users[id].email) {
      return users[id];
    }
  }
  return undefined;
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

///////////////////////////
// URL PAGE //
///////////////////////////

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    // username: req.cookies["username"],
    user: users[req.cookies['user_id']]
  };
  console.log(users, req.cookies);
  res.render("urls_index", templateVars);
});

///////////////////////////
// NEW URL //
///////////////////////////

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    // username: req.cookies["username"],
    user: users[req.cookies['user_id']]
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

///////////////////////////
// SHORT URL //
///////////////////////////

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    // username: req.cookies["username"],
    user: users[req.cookies['user_id']]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  // extract the value of shortURL
  const shortURL = req.params.shortURL;
  // extract the value from the form 
  const longURL = req.body.longURL;
  // gives the long URL 
  // update the longURL in url database 
  urlDatabase[shortURL] = longURL;
  // redirect /urls/shortURL
  res.redirect('/urls');
});

///////////////////////////
// REDIRECT TO LONG URL //
///////////////////////////

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

///////////////////////////
// REDIRECT WHEN DELETED //
///////////////////////////

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

///////////////////////////
// LOGIN //
///////////////////////////

app.post("/login", (req, res) => {
  // const username = req.body.username;

  const email = req.body.email;
  const password = req.body.password;
  const user = findUser(email);

  if (!email) {
    res.status(403).send('E-mail is empty');
  }

  else if (!password) {
    res.status(403).send('password is empty');
  }

  else if (user && password === user.password) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.status(403).send('The inputted password or email is incorrect.');
  }

});

app.get("/login", (req, res) => {
  let templateVars = {
    // username: req.cookies["username"],

    user: users[req.cookies['user_id']]
  }
  res.render("login", templateVars);
  res.redirect("/login");
});

///////////////////////////
// LOGOUT //
///////////////////////////

app.post("/logout", (req, res) => {
  // res.clearCookie('username');
  res.clearCookie('user_id');
  res.redirect("/urls");
});

///////////////////////////
// REGISTER//
///////////////////////////

app.get('/register', (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],
    user: users[req.cookies['user_id']]
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

  for (let user in users) {
    if (users[user].email === email) {
      return res.status(400).send('Email already exist.');
    }
  }

  users[id] = {
    id,
    email,
    password
  };

  res.cookie("user_id", id);
  res.redirect("/urls");
});