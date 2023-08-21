const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  purCourse: {},
})

const adminSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
})

const courseSchema = mongoose.Schema({
  id: { type: Number },
  title: { type: String },
  description: { type: String },
  price: { type: Number },
  imageLink: { type: String, required: false },
  published: { type: Boolean, required: false },
})

const User = mongoose.model("learnify-Users", userSchema)
const Admin = mongoose.model("learnify-Admin", adminSchema)
const Courses = mongoose.model("learnify-Courses", courseSchema)

module.exports = { User, Admin, Courses }
