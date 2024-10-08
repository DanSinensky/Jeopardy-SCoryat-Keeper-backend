import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import Score from '../models/Score.js';
import Game from '../models/Game.js';

const SALT_ROUNDS = process.env.NODE_ENV === "production" ? Number(process.env.SALT_ROUNDS) : 11;
const TOKEN_KEY = process.env.NODE_ENV === "production" ? process.env.TOKEN_KEY : "areallylonggoodkey";

const today = new Date();
const exp = new Date(today);
exp.setDate(today.getDate() + 30);

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('scores').exec();
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const signUp = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    const password_digest = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password_digest,
    });

    await user.save();
    await user.populate('scores');

    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      id: user._id,
      username: user.username,
      email: user.email,
      exp: parseInt(exp.getTime() / 1000),
    };

    const token = jwt.sign(payload, TOKEN_KEY);
    res.status(201).json({ token, user });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email }).select("username email password_digest").populate('scores').exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (await bcrypt.compare(password, user.password_digest)) {
      const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        exp: parseInt(exp.getTime() / 1000),
      };

      const token = jwt.sign(payload, TOKEN_KEY);
      res.status(201).json({ token, user });
    } else {
      res.status(401).send("Invalid Credentials");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, TOKEN_KEY);
    if (payload) {
      res.json(payload);
    }
  } catch (error) {
    console.log(error.message);
    res.status(401).send("Not Authorized");
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('scores').exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, username, email, password } = req.body;

    const updatedFields = { firstName, lastName, username, email };
    if (password) {
      const password_digest = await bcrypt.hash(password, SALT_ROUNDS);
      updatedFields.password_digest = password_digest;
    }

    const user = await User.findByIdAndUpdate(userId, updatedFields, { new: true }).populate('scores').exec();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.populate('scores').execPopulate();
    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await Score.deleteMany({ _id: { $in: user.scores } });
    await Game.updateMany({ scores: { $in: user.scores } }, { $pull: { scores: { $in: user.scores } } });

    res.status(200).json({ message: 'User and associated scores deleted successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};
