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

UserSchema.methods.validPassword = (password) => {
  return bcrypt.compareSync(password, this.passwordHash);
};

UserSchema.virtual("password").set( (value) => {
  this.passwordHash = bcrypt.hashSync(value, 12);
});

UserSchema.statics.listAllUsers = () => {
  return this.find().populate('matches').exec();
};

const User = mongoose.model("User", UserSchema);
module.exports = User;