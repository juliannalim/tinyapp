var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
let saltRounds = 10;

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com", userID: "aJ48lW"
  }
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
    password: "purple-monkey-dinosaur"
  }
};

const findUserByEmail = (email) => {
  for (let id in users) {
    if (email === users[id].email) {
      return users[id];
    }
  }
  return undefined;
}

const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = findUserByEmail(email);

  // if we got a user back and the passwords match then return the userObj
  if (user && bcrypt.compareSync(password, user.password)) {
    // user is authenticated
    return user;
  } else {
    // Otherwise return false
    return false;
  }
};

const urlsForUser = (id) => {
  const result = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === id) {
      result[shortURL] = urlDatabase[shortURL];
    }
  }
  return result;
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
  const userID = req.cookies.user_id;
  const urls = urlsForUser(userID);

  const templateVars = {
    urls: urlDatabase,
    // username: req.cookies["username"],
    user: users[req.cookies['user_id']],
    urls: urlsForUser(req.cookies.user_id)
  };
  // console.log(users[req.cookies['user_id']]);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  // console.log(req.body);
  longURLString = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURLString, userID: req.cookies['user_id'] };
  res.redirect(`/urls/${shortURL}`);
});

///////////////////////////
// NEW URL //
///////////////////////////

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login');
    return;
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies['user_id']]
  };
  res.render("urls_new", templateVars);
});

///////////////////////////
// SHORT URL //
///////////////////////////

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
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
  urlDatabase[shortURL].longURL = longURL;
  // redirect /urls/shortURL
  if (req.cookies.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  res.redirect('/urls');
});

///////////////////////////
// REDIRECT TO LONG URL //
///////////////////////////

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
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
  const password = req.body.password;// found in the req.params object
  // const user = findUser(email);

  if (!email) {
    res.status(403).send('E-mail is empty');
  }

  // Authenticate the user
  const user = authenticateUser(email, password);

  if (user) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
    console.log(user.password);
  } else {
    res.status(403).send('The inputted password or email is incorrect.');
  }

});

app.get("/login", (req, res) => {
  let templateVars = {
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
  const password = req.body.password;// found in the req.params object
  const id = generateRandomString();

  // check if the user is not already in the database

  // const user = findUserByEmail(email);

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
    password: bcrypt.hashSync(password, saltRounds),
  };

  res.cookie("user_id", id);
  res.redirect("/urls");
});