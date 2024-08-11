import express from "express";
import { cloudinaryUploadForm } from "../controllers/cloudinary.controller";

const router = express.Router();

router.get("/", cloudinaryUploadForm);


export default router;
