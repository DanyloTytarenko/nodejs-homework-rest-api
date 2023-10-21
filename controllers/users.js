const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const jimp = require("jimp");
const uuid = require("uuid").v4;
const User = require("../models/user");

const { HttpError, ctrlWrapper, sendEmails } = require("../helpers");

const { SECRET_KEY, URL } = process.env;

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
  const verificationToken = uuid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${URL}/users/verify/${verificationToken}">Click verify email</a>`,
  };

  await sendEmails(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};
const verify = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.json({
    message: "Verification successful",
  });
};

const resendVerify = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, "User not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${URL}/users/verify/${user.verificationToken}">Click verify email</a>`,
  };

  await sendEmails(verifyEmail);

  res.json({
    message: "Verification email sent",
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
  if (!user.verify) {
    throw HttpError(401, "Email not verified");
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
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
