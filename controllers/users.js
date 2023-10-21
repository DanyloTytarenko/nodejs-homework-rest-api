const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const jimp = require("jimp");

const User = require("../models/user");

const { HttpError, ctrlWrapper } = require("../helpers");

const { SECRET_KEY } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

// Registration

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

// Login

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

// Logout

const logout = async (req, res) => {
  const { _id: id } = req.user;

  const user = await User.findById(id);

  if (!user) {
    throw HttpError(401, "Not authorized");
  }

  await User.findByIdAndUpdate(id, { token: "" });
  res.status(204).json();
};

// Get current user
const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
};

// Update subscription
const updateSubscription = async (req, res) => {
  const { _id: id } = req.user;

  const user = await User.findById(id);

  if (!user) {
    throw HttpError(401, "Not authorized");
  }

  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  const { subscription } = updatedUser;
  res.json({ subscription });
};

// Update avatar
const updateAvatar = async (req, res) => {
  const { _id: id } = req.user;
  console.log(req.file.path);
  const { path: tempUpload, originalname } = req.file;
  console.log(tempUpload, originalname);
  const fileExtension = originalname.split(".").pop();
  const filename = `${id}.${fileExtension}`;
  const resultUpload = path.join(avatarsDir, filename);

  const image = await jimp.read(tempUpload);
  await image.resize(250, 250).writeAsync(tempUpload);

  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(id, { avatarURL });
  res.json({ avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
