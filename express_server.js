const express = require("express");
const { reduce } = require("lodash");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]}
  res.render("urls_show", templateVars);
});

//POST REQUESTS

app.post("/urls", (req, res) => {
  console.log(req.body);
  //Capture new longURL from req.body
  const longURL = req.body.longURL;
  //Assign random id to new longURL
  const id = generateRandomString();
  console.log('id', id);
  //Add new random id and new longURL
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

