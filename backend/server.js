require("dotenv").config();
const express=require("express")
const cors=require("cors");
const path=require("path");
const connectDb=require("./config/db");
const authRoutes=require("./routes/authRoute");
const bookRoutes=require("./routes/bookRoute");
const aiRoutes=require("./routes/aiRoute");
const exportRoutes=require("./routes/exportRoute");
const app=express();
 app.use(cors({
    origin:"*",
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"] 
 }))

 connectDb();

 app.use(express.json());

 app.use("/uploads",express.static(path.join(__dirname,"uploads")));
 app.use("/api/auth",authRoutes);
 app.use("/api/books",bookRoutes);
 app.use("/api/ai",aiRoutes);
 app.use("/api/export", exportRoutes);

 const PORT=process.env.PORT || 5000;

 app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
 })
