import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const totalVideos = await Video.countDocuments({ owner: userId })
    const totalSubscribers = await Subscription.countDocuments({ channel: userId })

    const viewsResult = await Video.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ])

    const likesResult = await Like.aggregate([
        {
            $match: {
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        { $unwind: "$video" },
        { $match: { "video.owner": mongoose.Types.ObjectId(userId) } },
        { $count: "totalLikes" }
    ])

    const totalViews = viewsResult[0]?.totalViews || 0
    const totalLikes = likesResult[0]?.totalLikes || 0

    return res.status(200).json(
        new ApiResponse(200, { totalVideos, totalSubscribers, totalViews, totalLikes }, "Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .populate({ path: "owner", select: "fullName username avatar" })

    return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

export {
    getChannelStats,
    getChannelVideos
}
