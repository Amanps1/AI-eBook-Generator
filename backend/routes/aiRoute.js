const express=require("express");
const {generateOutline, generateChapterContent}=require("../controller/aiController");
const protect=require("../middleware/authMiddleware");

const router=express.Router();

router.use(protect);

router.post("/generate-outline",generateOutline);
router.post("/generate-chapter-content",generateChapterContent);

module.exports=router;
