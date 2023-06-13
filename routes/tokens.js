const express = require("express");
const router = express.Router({ mergeParams: true });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { generateJWTToken } = require("./helpers/helpers");


// api/token/signup
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (await User.findOne({ username })) {
        return res.status(409).json({ error: "Username already exists" });
    }
    const hash = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hash });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, "verysecurekey", {
      expiresIn: "1d",
    });
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// api/tokens/login
router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ error: "User does not exist" });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid password" });
      }
      const token = jwt.sign({ userId: user._id }, "verysecurekey", {
        expiresIn: "1d",
      });
      res.json({ token });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message });
    }
  });
  

module.exports = router;
