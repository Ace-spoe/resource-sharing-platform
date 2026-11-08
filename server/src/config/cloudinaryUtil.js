const path = require("node:path");
const { cloudNname , apiKey , apiSecret } = require("./env");


const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: cloudNname,
  api_key: apiKey,
  api_secret: apiSecret
});

/**
 * Uploads a file buffer to Cloudinary as a raw file
 * @param {Buffer} buffer - The file buffer from multer memory storage
 * @param {string} filename - The original file name
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw', // Perfect for PDFs, docs, and PPTs
        folder: 'learning-resources-mvp', // Your target folder name
        public_id: filename, // Optional: keeps original filename or unique identifier
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    // End the stream by writing the buffer directly
    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};