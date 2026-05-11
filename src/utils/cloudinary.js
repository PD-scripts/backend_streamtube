import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const removeLocalFile = (path) => {
    if (!path) return
    if (fs.existsSync(path)) {
        fs.unlinkSync(path)
    }
}

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null

    try {
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        removeLocalFile(localFilePath)
        return response
    } catch (error) {
        removeLocalFile(localFilePath)
        return null
    }
}

export {uploadOnCloudinary}