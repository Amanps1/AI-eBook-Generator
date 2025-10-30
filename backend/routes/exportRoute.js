const express=require("express");


const router=express.Router();

const {exportAsDocument, exportAsPDF}=require("../controller/exportController");
const protect=require("../middleware/authMiddleware");  
router.use(protect);
router.get("/:id/doc",protect,exportAsDocument);
router.get("/:id/pdf", protect, exportAsPDF);


module.exports=router;