const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(cookieParser())

function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
};


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

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

let authenticateUser = function (email, password) {
  for (let user in users) {
    if (users[user].email === email) {
      if (users[user].password === password) {
        return users[user];
      }
    }
  }
  return false;
}

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
    user_id: req.cookies['user_id'],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.cookies['user_id'],
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

app.post("/urls", (req, res) => {
  console.log(req.body);
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
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

app.post("/urls/:shortURL", (req, res) => {
  let longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls`);
});

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
  if (email === '') {
    return res.status(400).send('Username name is blank.');
  }
  if (password === '') {
    return res.status(400).send('password name is blank.');
  }
  for (let user in users) {
    if (users[user].email === email)
      return res.status(400).send('email already exist.');
  }
  //If both checks pass, set the user_id cookie with the
  // matching user's random ID, then redirect to /urls.
  const id = generateRandomString();
  users[id] = {};
  users[id].id = id;
  users[id].email = req.body.email;
  users[id].email = password;
  // users[id] = {
  //   name: name,
  //   email: email,
  //   password: password
  // }
  res.cookie('user_id', users[name]);
  res.redirect('/urls')
});

app.get("/login", (req, res) => {
  let templateVars = { user_id: req.cookies['user_id'] };
  res.render("login", temgitplateVars);
});

app.post("/login", (req, res) => {
  if (!req.body.email) {
    return res.status(400).send('Email does not exist.');
  }
  if (!req.body.password) {
    return res.status(400).send('Password is incorrect.');
  }

  let user = authenticateUser(req.body.email, req.body.password);
  if (user) {
    res.cookie('user_id', user['id']);
    res.redirect(`/urls`);
  } else {
    return res.status(403).send('The inputted password for this email is incorrect.');
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
});

//im sorry! good luck mentor :)