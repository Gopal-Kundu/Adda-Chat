import {
  addUser,
  deleteChat,
  getAllChats,
  getAllMessage,
  markMessagesAsSeen,
  sendMessage,
  setMsgCountZero,
} from "../controllers/message.controller.js";
import {
  login,
  logout,
  register,
  remember,
  update,
  uploadProfilePhoto,
} from "../controllers/user.controller.js";
import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();
router.post("/register", register);
router.post("/update", isAuthenticated, update);
router.post("/login", login);
router.get("/logout", logout);

router.get("/getAllChats", isAuthenticated, getAllChats);
router.post("/sendmsg/:id", isAuthenticated, sendMessage);
router.get("/chat/:id", isAuthenticated, getAllMessage);
router.post("/adduser",isAuthenticated,addUser);
router.get("/remember", isAuthenticated, remember);
router.post(
  "/update/photo", isAuthenticated,
  upload.single("profilePhoto"),
  uploadProfilePhoto
);
router.get("/deleteChat/:id",isAuthenticated, deleteChat);
router.get("/setmsgcount/:id",isAuthenticated, setMsgCountZero);
router.get("/seen/:id", isAuthenticated, markMessagesAsSeen);

export default router;
