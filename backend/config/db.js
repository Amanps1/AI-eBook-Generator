const mongoose=require("mongoose");

const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected SuccessFully`);
    }catch(error){
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}

const connectDb=connectDB;

module.exports=connectDb;