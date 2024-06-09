import express from "express";
import cors from "cors";
import cookieparser from "cookieparser";
const app = express();
app.use(cors({origin: process.env.CORS_ORIGIN,credential: true,}));
app.use(express.json({limit: "16kb",}));
app.use(express.urlencoded({extended: true,limit: "16kb",}));
app.use(express.static("public"));
app.use(cookieparser());

// routes import
import userRouter from "./routes/user.routes.js";

// routes declaration
app.use("/user", userRouter)

export default app ;