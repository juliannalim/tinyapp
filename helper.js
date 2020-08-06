const bcrypt = require('bcrypt');

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


const getUserByEmail = (email, database) => {
  for (let userid in database) {
    if (database[userid].email === email) {
      return database[userid];
    }
  }
  return undefined;
};

const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = getUserByEmail(email, users);

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
};


module.exports = { urlDatabase, users, authenticateUser, getUserByEmail, urlsForUser };