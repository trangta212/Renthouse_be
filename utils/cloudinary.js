const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Cấu hình Cloudinary với validation
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Kiểm tra cấu hình Cloudinary
const validateCloudinaryConfig = () => {
  const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Thiếu biến môi trường Cloudinary: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ Cloudinary config validated successfully');
};

// Hàm upload file lên Cloudinary
const uploadToCloudinary = async (filePath, folder = 'contracts') => {
  try {
    // Validate config trước khi upload
    validateCloudinaryConfig();

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      throw new Error('File không tồn tại');
    }

    // Tạo tên file duy nhất
    const fileName = path.basename(filePath);
    const uniqueFileName = `${Date.now()}_${fileName}`;

    console.log(`📤 Đang upload file: ${fileName} lên Cloudinary...`);

    // Upload file lên Cloudinary với cấu hình chi tiết cho PDF
    const uploadOptions = {
      folder: folder,
      resource_type: 'raw', // Quan trọng: sử dụng 'raw' cho PDF thay vì 'auto'
      use_filename: true,
      unique_filename: true,
      filename_override: uniqueFileName,
      type: 'authenticated',
      overwrite: true,
      invalidate: true, // Xóa cache CDN
      timeout: 60000 // Timeout 60 giây
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    console.log('✅ Upload thành công:', result.secure_url);

    // Xóa file local sau khi upload thành công
    try {
      fs.unlinkSync(filePath);
      console.log('🗑️ Đã xóa file local');
    } catch (unlinkError) {
      console.warn('⚠️ Không thể xóa file local:', unlinkError.message);
    }

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('❌ Lỗi khi upload file lên Cloudinary:', error);
    
    // Log chi tiết lỗi để debug
    if (error.http_code) {
      console.error(`HTTP Code: ${error.http_code}`);
    }
    if (error.message) {
      console.error(`Error Message: ${error.message}`);
    }
    
    return {
      success: false,
      message: error.message,
      error_code: error.http_code || 'UNKNOWN'
    };
  }
};

// Hàm download file từ Cloudinary (để kiểm tra accessibility)
const downloadFromCloudinary = async (url) => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ File có thể truy cập từ Cloudinary');
    return {
      success: true,
      status: response.status,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    };
  } catch (error) {
    console.error('❌ Không thể truy cập file từ Cloudinary:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Hàm xóa file từ Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  try {
    validateCloudinaryConfig();
    
    console.log(`🗑️ Đang xóa file: ${publicId} từ Cloudinary...`);
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });
    
    console.log('✅ Xóa file thành công:', result);
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('❌ Lỗi khi xóa file từ Cloudinary:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Hàm test kết nối Cloudinary
const testCloudinaryConnection = async () => {
  try {
    validateCloudinaryConfig();
    
    // Test bằng cách lấy thông tin tài khoản
    const result = await cloudinary.api.ping();
    console.log('✅ Kết nối Cloudinary thành công:', result);
    
    return {
      success: true,
      message: 'Kết nối Cloudinary thành công'
    };
  } catch (error) {
    console.error('❌ Lỗi kết nối Cloudinary:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Hàm lấy URL có chữ ký (signed URL) cho file private
const getSignedUrl = (publicId, options = {}) => {
  try {
    const signedUrl = cloudinary.utils.private_download_url(publicId, 'raw', {
      expires_at: Math.floor(Date.now() / 1000) + 3600, // Hết hạn sau 1 giờ
      ...options
    });
    
    return {
      success: true,
      url: signedUrl
    };
  } catch (error) {
    console.error('❌ Lỗi tạo signed URL:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  downloadFromCloudinary,
  testCloudinaryConnection,
  getSignedUrl,
  validateCloudinaryConfig
};