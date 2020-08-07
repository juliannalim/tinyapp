const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = 8080;
const bodyParser = require("body-parser");
const { urlDatabase, users, authenticateUser, getUserByEmail, urlsForUser } = require('./helper');

let saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['my-s5cr5t-k5y-1s-that-1m-apotato', '1m-also-a-marshm5llow']
}));


function generateRandomString() {
  return Math.random().toString(36).substring(7);
}

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
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

////////////////////////////
//////// URL PAGE /////////
//////////////////////////

app.get("/urls", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    res.send("<p>You don't own this url!</p>");
  }

  else if (!req.session.user_id) {
    return res.status(403).send('<h1>SIGN IN YOU POTATO OR REGISTER!</h1>');
  }
  const userID = req.session.user_id;
  // const urls = urlsForUser(userID);

  const templateVars = {
    user: users[req.session['user_id']],
    urls: urlsForUser(req.session.user_id)
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURLString = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURLString, userID: req.session['user_id'] };
  res.redirect(`/urls/${shortURL}`);
});

///////////////////////////
/////// NEW URL //////////
/////////////////////////

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session['user_id']]
  };
  res.render("urls_new", templateVars);
});

////////////////////////////
//////// SHORT URL ////////
//////////////////////////

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('<h1>SIGN IN YOU POTATO OR REGISTER!</h1>');
  }

  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session['user_id']]
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
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  res.redirect('/urls');
});

///////////////////////////
// REDIRECT TO LONG URL //
/////////////////////////

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
  res.status(400).send('This short URL does not exist');
});


////////////////////////////
// REDIRECT WHEN DELETED //
//////////////////////////

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

///////////////////////////
///////// LOGIN //////////
/////////////////////////

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Authenticate the user
  const user = authenticateUser(email, password);

  // if user exist brings you to url page 
  // if it does not exist returns error message
  if (user) {
    req.session['user_id'] = user.id;
    res.redirect('/urls');
  } else {
    res.status(403).send('The inputted password or email is incorrect.');
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session['user_id']]
  };
  res.render("login", templateVars);
});

////////////////////////////
///////// LOGOUT //////////
//////////////////////////

app.post("/logout", (req, res) => {
  // deletes all the cookies
  req.session = null;
  res.redirect("/urls");
});

////////////////////////////
///////// REGISTER/////////
//////////////////////////

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
  };
  res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;// found in the req.params object
  const id = generateRandomString();

  // if password or email is blank, will return message
  if (password === ' ' || email === ' ') {
    return res.status(400).send('Password or Email Is Blank!');
  }
  // checking if the user already exists
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

  req.session['user_id'] = id;
  res.redirect("/urls");
});
