const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const serverless = require("serverless-http")
const mongoose = require("mongoose")
const { User, Admin, Courses } = require("./models/schemas")

const app = express()

app.use(express.json())
app.use(cors())

// let ADMIN = [{ username: "Prasoon", password: "test123" }]
// let USER = []
// let COURSES = []
let MONGO_URL = "mongodb+srv://sky5:sky5@cluster0.6hcywcy.mongodb.net/"
let SECRET = "lul-token"

const createJwtAdmin = (username) => {
  return jwt.sign({ username, role: "Admin" }, SECRET, {
    expiresIn: "1hr",
  })
}
const createJwtUser = (username) => {
  return jwt.sign({ username, role: "User" }, SECRET, {
    expiresIn: "1hr",
  })
}
const authJwt = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (authHeader) {
    const token = req.headers.authorization
    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403)
      }
      req.user = user
      next()
    })
  } else {
    res.sendStatus(401)
  }
}

app.get("/admin/courses", async (req, res) => {
  const courses = await Courses.find()
  res.status(200).json(courses)
})

app.post("/admin/signup", async (req, res) => {
  const { username, password } = req.body
  const admin = await Admin.findOne({ username })
  if (admin) {
    res.status(400).json({ msg: "Already User Exists" })
  } else {
    const newAdmin = new Admin({ username, password })
    newAdmin.save()
    res.status(200).json({ msg: "Successfully Created New Admin" })
  }
})

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body
  const admin = Admin.find({ username, password })
  if (admin) {
    const token = createJwtAdmin(username)
    res.status(200).json({ msg: "The admin has logged in", token })
  } else {
    res.status(403).json({ msg: "This admin does not exist" })
  }
})

app.post("/admin/courses", authJwt, (req, res) => {
  const { title, description, price, imageLink, published } = req.body
  const id = 0
  const newCourse = new Courses({
    id: id + 1,
    title,
    description,
    price,
    imageLink,
    published,
  })
  newCourse.save()
  res.json({ msg: "Course Created Successfully", courseId: newCourse.id })
})

app.put("/admin/courses/:courseId", authJwt, async (req, res) => {
  const courseId = req.params.courseId
  const updatedCourse = await Courses.findByIdAndUpdate(courseId, req.body, {
    new: true,
  })
  if (updatedCourse) {
    res.json({ msg: "Course Updated Successfully", updatedCourse })
  } else {
    res.status(403).send({ msg: "Course does not exist" })
  }
})

app.post("/users/signup", async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username, password })
  if (!user) {
    const newUser = new User({ username, password })
    newUser.save()
    res.status(200).send({ msg: "New User Created" })
  } else {
    res.status(403).send({ msg: "User already exist" })
  }
})

app.post("/users/login", async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username, password })
  if (user) {
    const token = createJwtUser(username)
    res.status(200).send({ msg: "User logged in successfully", token })
  } else {
    res.status(403).send({ msg: "User does not exist" })
  }
})

app.get("/users/courses", authJwt, async (req, res) => {
  const courses = await Courses.find()
  res.status(200).send(courses)
})

app.post("/users/courses/:courseId", authJwt, async (req, res) => {
  const courseId = req.params.courseId
  const { username } = req.body
  const course = await Courses.findById({ courseId })
  if (course) {
    const user = await User.find({ username })
    if (user) {
      User.purCourse.push(course)
      res.json({ message: "Course purchased successfully" })
    } else {
      res.status(403).json({ message: "user not found" })
    }
  } else {
    res.status(404).json({ message: "Course not found" })
  }
})

app.get("/users/purchasedCourse", authJwt, async (req, res) => {
  const { username } = req.body
  const user = await User.findOne({ username })
  if (user) {
    res.status(200).send(user)
  } else {
    res.status(403).send({ msg: "Something went wrong" })
  }
})

app.get("/users", (req, res) => {
  res.status(200).send(User)
})
app.get("/admins", (req, res) => {
  res.status(200).send({ Admin })
})

const lambdaHandler = serverless(app)

exports.handler = async (event, context) => {
  return await lambdaHandler(event, context)
}

mongoose
  .connect(MONGO_URL)
  .then(
    app.listen(5000, () => {
      console.log("Server is running on port 5000")
    })
  )
  .catch((err) => {
    console.log(err)
  })
