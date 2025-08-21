const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function register(req, res) {
    try {
        console.log("Registering user...");
        const { name, email, password } = req.body;

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).send("User already exists");
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        res.cookie("token", token);

        return res.status(201).json({
            message: "User registered successfully",
            user
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid credentials");
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        res.cookie("token", token);

        return res.status(200).json({
            message: "User logged in successfully",
            user
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    register,
    login
};
