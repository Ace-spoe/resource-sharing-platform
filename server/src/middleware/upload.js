const multer = require('multer');

const storage = multer.memoryStorage();

// 1. Define the file filter function
const fileFilter = (req, file, cb) => {
  // Allowed MIME types
 const allowedTypes = [
  'image/jpeg', 
  'image/png', 
  'image/webp', 
  'application/pdf', 
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
  ];

  if (allowedTypes.includes(file.mimetype)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file with a custom error message
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and Word documents are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter // <-- Hook it up here
});

module.exports = upload;