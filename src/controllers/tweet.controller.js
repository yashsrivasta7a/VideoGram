import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    const user = req.user?._id
    const tweet = await Tweet.create({
        content,
        owner: user
    })
    return res.status(200)
    .json(new ApiResponse(200,tweet,"Tweet published"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(404,"User not found");
    }
    const userTweets = await Tweet.find({
        owner: userId
    })

    return res.status(200)
    .json(new ApiResponse(200,userTweets,"Got the user tweets"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.body
    const {content} = req.params

    if(!content){
        throw new ApiError(400,"Content is missing")
    }
    
    const updateTweet = await Tweet.findByIdAndUpdate(
        tweetId,{
            $set:{
                content:content
            }
        },
        {
            new:true
        }
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400,"Tweet not found")
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId);

    return res.status(200)
    .json(200,"Tweet deleted ");
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}