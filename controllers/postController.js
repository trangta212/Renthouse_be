require("dotenv").config();
const { createPost } = require("../queries/postQuery");

const createPostController = async (req, res) => {
    try {
        const postData = req.body;
        if (!postData || !postData.email) {
            return res.status(400).json({ error: "Dữ liệu đầu vào không hợp lệ" });
        }

        const newPost = await createPost(postData);

        return res.status(200).json({
            success: true,
            message: "Bài đăng đã được tạo thành công!",
            data: newPost
        });
    } catch (error) {
        console.error("Lỗi khi tạo bài đăng:", error);
        return res.status(500).json({
            success: false,
            error: "Đã xảy ra lỗi khi tạo bài đăng. Vui lòng thử lại!"
        });
    }
};

module.exports = { createPostController };


