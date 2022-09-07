const express = require("express");
const cookieParser = require('cookie-parser')
const { reduce } = require("lodash");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// console.log(urlDatabase["b2xVn2"]);


function generateRandomString() {
  let random = Math.random().toString(36).substring(2, 8);
  // console.log('random', random);
  return random;
};

//GET REQUESTS

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,  username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  //Capture id entered into url after /u/
  //console.log(req.params.id);
  //Match new key in urlDatabase to longURL
  const longURL = urlDatabase[req.params.id];
  //Redirect back to longURL
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("registration", templateVars);
});

//POST REQUESTS

app.post("/urls", (req, res) => {
  //console.log(req.body);
  //Capture new longURL from req.body
  const longURL = req.body.longURL;
  //Assign random id to new longURL
  const id = generateRandomString();
  //Add new random id and new longURL
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id", (req, res) => {
  console.log(req.params);
  console.log(req.body);
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params);
  //Capture id from object
  const id = req.params.id;
  //Delete url based off of id
  delete urlDatabase[id];
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  //console.log(req.body);
  //Set cookie named username 
  //res.cookie(name, value)
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
