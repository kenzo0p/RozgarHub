import { Router } from "express";
import {
  getCompany,
  getCompanyById,
  updateCompany,
  registerCompany
} from "../controllers/company.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";
import { singleUpload } from "../middlewares/multer.middlerware.js";

const router = Router();
router.route("/register").post(isAuthenticated,registerCompany);
router.route("/get").get(isAuthenticated,getCompany);
router.route("/get/:id").get(isAuthenticated,getCompanyById);
router.route("/update/:id").put(isAuthenticated,singleUpload, updateCompany);

export default router;
