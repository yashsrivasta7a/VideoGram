import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400,"Either of the block is empty")
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })
    return res.status(201).json(new ApiResponse(200, playlist, "Playlist Created Successfully"))
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid Playlist Id")
    }

    const userPlaylist = await Playlist.find({
        owner: userId
    })
    
    return res.status(200).json(new ApiResponse(200, userPlaylists, "User Playlists Fetched Successfully"))
})
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id")
    }
    const playlist = await Playlist.findById(playlistId)
    return res.status(200)
    .json(new ApiResponse(200, playlist, "Playlist Details Fetched Successfully"))
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push:{
                videos:videoId
            }},
            {
                new: true, useFindAndModify: false
            }
        
    )
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist" ))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push:{
                videos:videoId
            }},
            {
                new: true, useFindAndModify: false
            }
        
    )
    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Video deleted from playlist" ))
    
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const deleteplaylist = await Playlist.findByIdAndDelete(
        {id: playlistId}
    )
    return res.status(200)
    .json(new ApiResponse(200, {}, "Playlist Deleted Successfully"))
})
    // TODO: delete playlist

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    const updatePlaylistDetails = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name: name,
            description: description
        },
        {
            new: true
        }
    );
    
    

    return res.status(200)
    .json(new ApiResponse(200, updatePlaylistDetails, "Playlist Details Updated Successfully"))
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}