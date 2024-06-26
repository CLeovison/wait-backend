import User from "../model/User/User.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { secretKey } from "../util/SecretToken.mjs";
import Mail from "../util/Mail.mjs";
export const UserController = {
  registerUser: async (req, res) => {
    const newUser = new User(req.body);

    //Validating When The User Already Exist
    const userExist = await User.findOne({
      username: req.body.username,
      email: req.body.email,
    });
    if (userExist) return res.status(401).send("The User Already Exist");

    try {
      const savedUser = await newUser.save();
      return res.status(201).json({ message: "Registration Successful" });
    } catch (error) {
      return res.status(400).send("Registration Was Unsucessful");
    }
  },

  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ message: "User Not Found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      //JWT Authentication

      const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: "1h" });

      res.json({
        message: "Logged in Successfully",
        token,
        user: { id: user._id, username: user.username },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Login Failed" });
    }
  },

  getPaginatedUser: async (req, res) => {
    const {
      page = 1,
      limit = 10,
      sort = "fname".toLowerCase(),
      sortOrder = "asc",
      ...filters
    } = req.query;

    const filterObj = { ...filters };

    //Validating the Page And Limit
    if (!Number.isInteger(Number(limit)) || !Number.isInteger(Number(page))) {
      res.status(404).send({ message: "Invalid limit and page provided" });
    }
    // Validating the SortOrder
    if (!["asc", "desc"].includes(sortOrder)) {
      res
        .status(404)
        .send({ message: "The order that you must put is asc or desc" });
    }
    // //Filter Validation Logic
    if (
      filters.fname &&
      !filters.fname.split(",").every((tag) => typeof tag === "string")
    ) {
      res.status(404).send({ message: "Invalid Format" });
    }

    try {
      const users = await User.find(filterObj)
        //Computed Property Names/Object Initializer
        .sort({ [sort]: sortOrder === "asc" ? 1 : -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const count = await User.countDocuments();

      const totalPage = Math.ceil(count / limit);

      res.status(201).json({
        users,
        totalPage,
        currentPage: page,
        limit,
        count: users.length,
      });
    } catch (error) {
      res.status(404).send({ message: error });
    }
  },
  getUserID: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.status(200).send(user);
    } catch (error) {
      res.status(404).send(error);
    }
  },
  getSearch: async (req, res) => {
    const searchTerm = req.query.term;

    if (!searchTerm) {
      return res.status(400).json({ message: "No search term provided" });
    }
    try {
      const results = await User.find({
        $text: { $search: searchTerm },
      });

      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ message: "Error searching for users", error });
    }
  },

  updateUser: async (req, res) => {
    try {
      const updateUsers = await User.findByIdAndUpdate(req.params.id, req.body);
      res.status(201).send(updateUsers);
    } catch (error) {
      res.status(404).send(error);
    }
  },
  deleteUser: async (req, res) => {
    try {
      const deleteUser = await User.findById(req.params.id);
      deleteUser.isSoftDelete = true;
      deleteUser.save();
      res
        .status(200)
        .send({ message: "The User Has Been Successfully Deleted" });
    } catch (error) {
      res.status(404).send(error);
    }
  },
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(401).json({ message: "The User Doesn't Exist" });

      const secret = secretKey + user.password;
      const token = jwt.sign({ id: user._id, email: user.email }, secret, {
        expiresIn: "1h",
      });

      const resetURL = `http://localhost:5000/api/users/reset-password/${user._id}/${token}`;
      console.log(resetURL);
      
      Mail({ email: email, link: resetURL });
      return res.status(200).json({ message: "Please Reset Your Password" });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ error: "Please Provide A Correct Email", error });
    }
  },

  resetPass: async (req, res) => {
    const { id, token } = req.params;

    try {
      const user = await User.findOne({ _id: id });
      if (!user) {
        return res.status(401).json({ message: "The User Doesn't Exist" });
      }

      const secret = secretKey + user.password;
      const verifyUser = jwt.verify(token, secret);

      const updatePass = await User.findById(id);
      updatePass.password = req.body.password;
      updatePass.save();

      res.status(200).json({ message: "Success!" });
    } catch (error) {
      console.log(error);
      res.status(401).json({ message: "You're Credentials Are Not Verified" });
    }
  },
};

//Reference
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer
