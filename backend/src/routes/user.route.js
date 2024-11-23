import { Router } from "express";
import {
  loginUser,
  logOut,
  registerUser,
  updateProfile,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";
import { singleUpload } from "../middlewares/multer.middlerware.js";

const router = Router();
router.route("/register").post(singleUpload,registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logOut);
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);

export default router;
