const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");
const findOrCreate = require('mongoose-findorcreate')
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  username: { type: String, unique: true },
  passwordHash: { type: String },
  played: { type: Number, default: 0},
  matches: [{type: Schema.Types.ObjectId, ref: 'Match'}]
}, {collection: 'users' });

UserSchema.index({username: 1}, {unique: true});
UserSchema.plugin(uniqueValidator);
UserSchema.plugin(findOrCreate);

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

// virtual, statics, and methods can all perform any of these operations called the same way lol

UserSchema.virtual("password").set(function(value) {
  this.passwordHash = bcrypt.hashSync(value, 12);
});

UserSchema.statics.listAllUsers = () => {
  return this.find().populate('matches').exec();
};

const User = mongoose.model("User", UserSchema);
module.exports = User;