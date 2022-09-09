//HELPER FUNCTIONS

const getUserByEmail = function (email, database) {
  for (let user in database) { 
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

const generateRandomString = function() {
  let random = Math.random().toString(36).substring(2, 8);
  return random;
};

const urlsForUser = function(urlDatabase, user_id) {
  let newObj = {};
  for (let key in urlDatabase) {
    if (user_id === urlDatabase[key].userID) {
      newObj[key] = urlDatabase[key];
    }
  }
  return newObj;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };