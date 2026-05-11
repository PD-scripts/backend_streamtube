import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    const filters = {}
    if (userId && isValidObjectId(userId)) {
        filters.owner = userId
    }

    if (query?.trim()) {
        filters.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    const sortOptions = { [sortBy]: sortType === "asc" ? 1 : -1 }
    const pageNumber = Number(page) || 1
    const pageSize = Number(limit) || 10

    const videos = await Video.find(filters)
        .populate({ path: "owner", select: "fullName username avatar" })
        .sort(sortOptions)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)

    const total = await Video.countDocuments(filters)

    return res.status(200).json(
        new ApiResponse(200, { videos, total, page: pageNumber, limit: pageSize }, "Videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body
    const videoFilePath = req.files?.videoFile?.[0]?.path
    const thumbnailPath = req.files?.thumbnail?.[0]?.path

    if (!title?.trim() || !description?.trim() || !duration) {
        throw new ApiError(400, "Title, description and duration are required")
    }

    if (!videoFilePath || !thumbnailPath) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    if (!videoFile?.url || !thumbnail?.url) {
        throw new ApiError(500, "Unable to upload video or thumbnail")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: Number(duration),
        owner: req.user._id
    })

    return res.status(201).json(new ApiResponse(201, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId).populate({ path: "owner", select: "fullName username avatar" })

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description, duration, isPublished } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const updates = {}
    if (title?.trim()) updates.title = title
    if (description?.trim()) updates.description = description
    if (duration) updates.duration = Number(duration)
    if (typeof isPublished === "boolean") updates.isPublished = isPublished

    const thumbnailPath = req.file?.path
    if (thumbnailPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailPath)
        if (!thumbnail?.url) {
            throw new ApiError(500, "Unable to upload thumbnail")
        }
        updates.thumbnail = thumbnail.url
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No update fields provided")
    }

    const video = await Video.findByIdAndUpdate(videoId, updates, { new: true })

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findByIdAndDelete(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res.status(200).json(
        new ApiResponse(200, video, `Video publish status updated to ${video.isPublished}`)
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
