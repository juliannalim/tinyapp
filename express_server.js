const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

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
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "t4rd7l"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "r73j2k"
  }
};

function generateRandomString() {
  return Math.random().toString(36).substring(7);
}

const authenticateUser = function (email, password) {
  for (let user in users) {
    if (users[user].email === email) {
      if (users[user].password === password) {
        return users[user];
      }
    }
  }
  return false;
}

const urlsForUser = function (userId) {
  // console.log('userId in start of function', userId);
  // console.log('urlDatabase', urlDatabase);
  const result = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === userId) {
      console.log('matched data: ', shortURL, urlDatabase[shortURL]);
      result[shortURL] = urlDatabase[shortURL];
    }
  }
  console.log('result before returning: ', result);
  return result;
}

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// ==============
// ===URLS===
// ==============

app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const urls = urlsForUser(userID);

  console.log('returned data: ', urls);

  const templateVars = {
    user_id: users[req.cookies.user_id],
    urls: urlsForUser(req.cookies.user_id)
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  // something here needs to change 
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login');
    return;
  }
  let templateVars = {
    user_id: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user_id: req.cookies['user_id'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // delete urlDatabase[req.params.shortURL]
  if (req.cookies.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL]
  }
  res.redirect('/urls/');
});

app.post("/urls/:shortURL", (req, res) => {
  // let longURL = req.body.longURL;
  // const shortURL = req.params.shortURL;
  // urlDatabase[shortURL] = longURL
  if (req.cookies.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  // res.redirect(`/urls`);
  res.redirect(`/urls/${req.params.shortURL}`);
});

// ====================
// ===AUTHENTICATION===
// ====================

// Display the register form to the user
app.get('/register', (req, res) => {
  const templateVars = { user_id: req.cookies['user_id'] };
  res.render('register', templateVars);
});

//Catch the submit of the register form
app.post('/register', (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    return res.status(400).send('Email and password cannot be blank.');
  }

  for (let user in users) {
    if (users[user].email === email)
      return res.status(400).send('Email already exist.');
  }
  //If both checks pass, set the user_id cookie with the
  // matching user's random ID, then redirect to /urls.
  const id = generateRandomString();
  users[id] = {
    id, password, email
  };

  res.cookie('user_id', users[id].id);
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const templateVars = { user_id: users[req.cookies.user_id] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  if (!req.body.email) {
    res.status(400).send('Email does not exist.');
  }
  if (!req.body.password) {
    res.status(400).send('Password is incorrect.');
  }

  let user = authenticateUser(req.body.email, req.body.password);
  if (user) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.status(403).send('The inputted password for this email is incorrect.');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//im sorry! good luck mentor :)