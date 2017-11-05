// let passwordHash = require('password-hash');

// let hash = function (text) {
//   return passwordHash.generate(text);
// };

// let check = function (pass, hash) {
//   return passwordHash.verify(pass, hash);
// };

let hash = function (text) {
  return require('password-hash').generate(text);
};

let check = function (pass, hash) {
  return require('password-hash').verify(pass, hash);
};

exports.hash = hash;
exports.check = check;