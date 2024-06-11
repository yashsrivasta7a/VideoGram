import dotenv from "dotenv"
import connectDB from "./db/index.js";
import express from "express";

const app = express();

dotenv.config ({
    path:"./env"
})

connectDB().then(()=>{
    app.on("error",(error)=>{
        console.log(`error:${error}`);
        throw error
    })
    app.listen(process.env.PORT || 8000 , 
        ()=>{
            console.log(`server is runing at PORT : ${process.env.PORT}` );
        })
})
.catch((error)=>{
    console.log(`Connection failed with DataBase`,error);
})