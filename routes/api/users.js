const express = require("express");

const ctrl = require("../../controllers/users");

const { validateBody, authenticate, upload } = require("../../middlewares");

const schemas = require("../../schemas/users");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);
router.get("/verify/:verificationToken", ctrl.verify);

router.post("/verify", validateBody(schemas.emailSchema), ctrl.resendVerify);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

router.post("/logout", authenticate, ctrl.logout);

router.get("/current", authenticate, ctrl.getCurrent);

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  ctrl.updateAvatar
);

router.patch(
  "/",
  authenticate,
  validateBody(schemas.subscriptionSchema),
  ctrl.updateSubscription
);

module.exports = router;
