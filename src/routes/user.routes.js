import { Router } from "express";
import {loginUser, registerUser,logoutUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverimage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser)

router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT, logoutUser) //secured route
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT,changeCurrentPassword) // jwt lagaya jisse only verified user aye
router.route('/current-user').get(verifyJWT,getCurrentUser) // data send ni hora so get krdiaa
router.route('/update-account-details').patch(verifyJWT,updateAccountDetails) 
router.route('/avatar').patch(verifyJWT,upload.single("avatar"),updateUserAvatar) 
router.route('/coverImage').patch(verifyJWT,upload.single("coverImage"),updateUserCoverimage) 
router.route('/c/:username').get(verifyJWT,getUserChannelProfile) 
router.route('watch-history').get(verifyJWT,getWatchHistory)

 


export default router