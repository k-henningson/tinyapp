//REQUIREMENTS

const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const { urlDatabase, users } = require("./database");
const app = express();
const PORT = 8080; // default port 8080

//SETUP & MIDDLEWARES

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['cookie1fortinyApp', 'cookie2fortinyApp' ],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//ROUTES & ENDPOINTS

app.get("/", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//CRUD OPERATIONS

//GET REQUESTS - READ

app.get("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.send(`<h3>You must login first!</h3>`);
  }
  const user_urls = urlsForUser(urlDatabase, req.session.user_id);
  const templateVars = { urls: user_urls,  user: users[req.session["user_id"]]};
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[req.session["user_id"]]};
  return res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.send(`<h3>You must login first!</h3>`);
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send(`<h3>You do not own this URL!</h3>`);
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session["user_id"]]};
  return res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send(`<h3>ID does not exist</h3>`);
  }
  //Capture id entered into url after /u/
  //Match new key in urlDatabase to longURL
  const longURL = urlDatabase[req.params.id].longURL;
  //Redirect back to longURL
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  }
  return res.render("registration", {user: null});
});

app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  }
  return res.render("login", {user: null});
});

//POST REQUESTS - CREATE

app.post("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.send(`<h3>You must login first!</h3>`);
  }
  //Capture new longURL from req.body
  const longURL = req.body.longURL;
  //Assign random id to new longURL
  const id = generateRandomString();
  //Add new random id and new longURL
  urlDatabase[id] = {longURL: longURL, userID: req.session.user_id};
  return res.redirect(`/urls/${id}`);
});

app.post("/urls/:id", (req, res) => {
  if (!req.params.id) {
    return res.send(`<h3>ID should exist</h3>`);
  }
  if (!users[req.session.user_id]) {
    return res.send(`<h3>You must login first!</h3>`);
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send(`<h3>You do not own this URL!</h3>`);
  }
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL: longURL, userID: req.session.user_id};
  return res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.params.id) {
    return res.send(`<h3>ID should exist</h3>`);
  }
  if (!users[req.session.user_id]) {
    return res.send(`<h3>You must login first!</h3>`);
  }
  if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    return res.send(`<h3>You do not own this URL!</h3>`);
  }
  //Capture id from object
  const id = req.params.id;
  //Delete url based off of id
  delete urlDatabase[id];
  return res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let currentUser = getUserByEmail(email, users);
  if (!currentUser) {
    return res.status(403).send('User cannot be found');
  }
  if (!bcrypt.compareSync(password, currentUser.password)) {
    return res.status(403).send('Password is not correct');
  }
  //Set cookie named user_id
  //res.cookie(name, value)
  req.session.user_id = currentUser.id;
  return res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  //Generate random user ID
  const user_id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (email === '' || req.body.password === '') {
    return res.status(400).send('No email or password entered');
  }
  let currentUser = getUserByEmail(email, users);
  if (currentUser) {
    return res.status(400).send('User already exists');
  }
  //Add new user object to global user object
  users[user_id] = {
    id: user_id,
    email: email,
    password: password
  };
  //Set userID cookie name & value
  req.session.user_id = user_id;
  //Check if users object appended to
  return res.redirect(`/urls`);
});

//LISTENER

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


