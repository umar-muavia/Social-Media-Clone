const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  username: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "visitor"
  }
});

const UserModel = mongoose.model("User", UserSchema); /// ref
module.exports = UserModel;
