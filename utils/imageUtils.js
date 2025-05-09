const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only jpeg and png
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only .png and .jpg files are allowed!'), false);
    }
  }
});

// Process and optimize image
const processImage = async (filePath) => {
  try {
    const optimizedPath = filePath.replace(/\.[^/.]+$/, '') + '-optimized.jpg';
    
    await sharp(filePath)
      .resize(800, 800, { // Resize to max dimensions
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
      .toFile(optimizedPath);

    // Delete original file
    fs.unlinkSync(filePath);
    
    return optimizedPath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

// Convert base64 to file
const base64ToFile = async (base64String, filename) => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    
    return filePath;
  } catch (error) {
    console.error('Error converting base64 to file:', error);
    throw error;
  }
};

module.exports = {
  upload,
  processImage,
  base64ToFile
};