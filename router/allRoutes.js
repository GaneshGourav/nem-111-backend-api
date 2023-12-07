const express = require("express");
const { userModel } = require("../model/userModel");
const { blogModel } = require("../model/blogModel");
const { auth } = require("../middleWare/authentication");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const allRouter = express.Router();

allRouter.post("/register", async (req, res) => {
  const { username, avatar, email, password } = req.body;

  let existUser = await userModel.findOne({ email });

  try {
    if (!existUser) {
      bcrypt.hash(password, 5, async (err, hash) => {
        if (err) {
          res.status(400).json({ warning: "Something went wrong, Try again" });
          return;
        }

        let user = new userModel({ username, avatar, email, password: hash });
        await user.save();
        res.status(200).json({ msg: "Account created Successfully", user });
      });
    } else {
      res.status(400).json({ msg: "Allready registerd , try to login" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

allRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await userModel.findOne({ email });

  try {
    if (user) {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (result) {
          let token = jwt.sign(
            { userId: user._id, username: user.username },
            "ganesh"
          );
          res
            .status(200)
            .json({ mag: "Logged in Successfully", token, userId: user._id });
        } else {
          res.status(400).json({ msg: "Your email or password is wrong" });
        }
      });
    } else {
      res
        .status(400)
        .json({ msg: "You're not registerd , try to register yourself." });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

allRouter.get("/blogs", auth, async (req, res) => {
  const { title, category, sort, order } = req.query;

  try {
    let query = {};

    if (title !== "") {
      query.title = { $regex: new RegExp(title, "i") };
    }
    if (category !== "") {
      query.category = { $regex: new RegExp(category, "i") };
    }

    let sorting = {};
    if (sort !== "" && order !== "") {
      let sortOrder = order === "asc" ? 1 : -1;
      sorting.sort = sortOrder;
    }

    let blog = await blogModel.find(query).sort(sorting);
    res.status(200).json({ blog });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

allRouter.post("/blogs", auth, async (req, res) => {
  try {
    let data = new blogModel(req.body);
    await data.save();
    res.status(200).json({ msg: "Blog Created Successfully", data });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

allRouter.patch("/blogs/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    let updateBlog = await blogModel.findByIdAndUpdate(
      { _id: id, userId: req.body.userId },
      req.body
    );
    res.status(200).json({ msg: "Blog Updated Successfully", data });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

allRouter.delete("/blogs/:id", auth, async (req, res) => {
  const { id } = req.params;

  try {
    let deleteBlogs = await blogModel.findByIdAndDelete({
      _id: id,
      userId: req.body.userId,
    });
    res.status(200).json({ msg: "Blog deleted Successfully", data });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

allRouter.patch("/blogs/:id/like", auth, async (req, res) => {
  const { id } = req.params;
  try {
    let blogs = await blogModel.findOne({ _id: id });
    let value = blogs.likes + 1;
    req.body = { ...req.body, likes: value };
    let updateLikes = await blogModel.findByIdAndUpdate({ _id: id }, req.body);
    res.status(200).json({ msg: "likes are increased", data });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

allRouter.patch("/blogs/:id/comment", auth, async (req, res) => {
  const { id } = req.body;

  try {
    let blogs = await blogModel.findOne({ _id: id });
    let value = { username: req.body.username, content: req.body.content };
    blogs.comments.push(value);
    let updateComment = await blogModel.findByIdAndUpdate({ _id: id }, blogs);
    res.status(200).json({ msg: "Comment added Successfully", data });
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
  }
});
module.exports = { allRouter };
