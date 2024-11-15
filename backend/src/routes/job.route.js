import { Router } from "express";
import {
  postJob,
  getAdminJobs,
  getAllJob,
  getJobById,
} from "../controllers/job.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";

const router = Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(getAllJob);
router.route("/getadminjob").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);

export default router;
