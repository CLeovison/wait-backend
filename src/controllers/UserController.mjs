import User from "../model/User/User.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { secretKey } from "../util/SecretToken.mjs";



export const UserController = {
  registerUser: async (req, res) => {
    // Declaring a new variable to call the UserSchema and requesting the whole body of it
    const newUser = new User(req.body);

    if (!newUser === "") {
      res.status(401).json({ message: "The form must be fill up" });
    } else {
      res.status(201).json({ message: "Registration Successful" });
    }

    try {
      const savedUser = await newUser.save();
    } catch (error) {
      res.status(404).send(error);
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


      const { sign, verify } = jwt;
      const token = sign({ id: user._id }, secretKey, { expiresIn: "1h" });

      res.json({
        message: "Logged in Successfully",
        token,
        user: { id: user._id, username: user.username },
      });
    } catch (error) {
      res.status(500).json({ message: "Login Failed", error });
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
      const deleteUser = await User.findByIdAndDelete(req.params.id);
      res
        .status(200)
        .send({ message: "The User Has Been Successfully Deleted" });
    } catch (error) {
      res.status(404).send(error);
    }
  },
};

//Reference
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer
