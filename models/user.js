// fake user interface
var authUserClass = function(username, password) {
  this.username = username;
  this.password = password;
};
authUserClass.prototype.validPassword = function(password) {
  console.log(password, this.password)
  if (password === this.password) {
    return true;
  }
  return false;
};


var UserClass = function() {
  this.users = {};
};
UserClass.prototype.findOne = function(username, cb) {
  var password = this.users[username];
  if (password !== undefined) {
    var returnUser = new authUserClass(username, password);
  }
  else {
    var returnUser = null;
  }
  cb(null, returnUser);
};
UserClass.prototype.create = function(username, password) {
  this.users[username] = password;
}
UserClass.prototype.isExist = function(username) {
  console.log(this.users[username]);
  return (this.users[username] !== undefined);
};
module.exports = UserClass;