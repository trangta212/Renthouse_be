// require('dotenv').config(); // NHỚ load .env ở đầu file

const { Deposit, Notification, Contract, RentPost, User, Room } = require('../models');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Khởi tạo transporter từ .env
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
const formatDate = (date) => {
    if (!date || isNaN(new Date(date))) return 'Không xác định';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

const generateContractPDF = async (contractData) => {
    // Định nghĩa đường dẫn lưu file PDF
    const pdfPath = path.join(__dirname, `../contracts/contract_${contractData.deposit_id}.pdf`);
    
    // Đảm bảo thư mục contracts tồn tại
    const contractDir = path.dirname(pdfPath);
    if (!fs.existsSync(contractDir)) {
      fs.mkdirSync(contractDir, { recursive: true });
    }
  
    // Khởi tạo PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });
  
    // Đăng ký font hỗ trợ tiếng Việt
    const fontPath = path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf');
    if (!fs.existsSync(fontPath)) {
      throw new Error(`Font file not found at ${fontPath}`);
    }
    doc.registerFont('Roboto', fontPath);
  
    // Tạo luồng ghi file PDF
    doc.pipe(fs.createWriteStream(pdfPath));
  
    // Phần quốc hiệu
    doc
      .font('Roboto')
      .fontSize(14)
      .text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', { align: 'center' })
      .moveDown(0.5);
    
    doc
      .fontSize(12)
      .text('Độc lập – Tự do – Hạnh phúc', { align: 'center' })
      .moveDown(1.5);
  
    // Dòng phân cách
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(1);
  
    // Tiêu đề hợp đồng
    doc
      .fontSize(16)
      .font('Roboto')
      .text('HỢP ĐỒNG THUÊ PHÒNG TRỌ', { align: 'center' })
      .moveDown(2);
  
    // Ngày và địa điểm ký hợp đồng
    const today = new Date();
    const formattedDate = `${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
    doc
      .font('Roboto')
      .fontSize(12)
      .text(`Hôm nay, ngày ${formattedDate}`,{ align: 'right' })
      .moveDown(0.5)
      .text('Chúng tôi gồm:')
      .moveDown(1);
  
    // Thông tin Bên A (Bên cho thuê)
    doc
      .font('Roboto')
      .fontSize(12)
      .font('Roboto')
      .text('1. Đại diện bên cho thuê phòng trọ (Bên A):')
      .moveDown(0.5);
    doc
      .font('Roboto')
      .text(`Ông/bà: ${contractData.landlord_name || '...'}`)
      .text(`Sinh ngày: ${contractData.landlord_birthday || '...'}`)
      .text(`Nơi đăng ký HK: ${contractData.landlord_address || '...'}`)
      .text(`CMND số: ${contractData.landlord_id_number || '...'} cấp ngày ${contractData.landlord_id_date || '...'} tại: ${contractData.landlord_id_place || '...'}`)
      .text(`Số điện thoại: ${contractData.landlord_phone || '...'}`)
      .moveDown(1);
  
    // Thông tin Bên B (Bên thuê)
    doc
      .font('Roboto')
      .fontSize(12)
      .font('Roboto')
      .text('2. Bên thuê phòng trọ (Bên B):')
      .moveDown(0.5);
    doc
      .font('Roboto')
      .text(`Ông/bà: ${contractData.renter_name || '...'}`)
      .text(`Sinh ngày: ${contractData.renter_birthday || '...'}`)
      .text(`Nơi đăng ký HK: ${contractData.renter_address || '...'}`)
      .text(`CMND số: ${contractData.renter_id_number || '...'} cấp ngày ${contractData.renter_id_date || '...'} tại: ${contractData.renter_id_place || '...'}`)
      .text(`Số điện thoại: ${contractData.renter_phone || '...'}`)
      .moveDown(1);
  
    // Điều khoản thuê
    doc
      .font('Roboto')
      .fontSize(12)
      .text(`Sau khi bàn bạc, Bên A đồng ý cho Bên B thuê 01 phòng tại địa chỉ: ${contractData.address || '...'}`)
      .moveDown(0.5);
    doc
       .text(`Giá thuê: ${
        contractData.rental_price 
          ? (parseFloat(String(contractData.rental_price).replace(',', '.')) * 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) 
          : '...'
      } đ/tháng`)
      .text(`Hình thức thanh toán: ${contractData.payment_method || 'Chuyển khoản'}`)
      .moveDown(0.5);
    doc
      .text(`Tiền điện: ${contractData.electricity_price ? contractData.electricity_price.toLocaleString('vi-VN') : '...'} đ/kWh, thanh toán vào cuối tháng`)
      .text(`Tiền nước: ${contractData.water_price ? contractData.water_price.toLocaleString('vi-VN') : '...'} đ/người, thanh toán vào đầu tháng`)
      .moveDown(0.5);
    doc
      .text(`Tiền đặt cọc: ${contractData.deposit_amount ? contractData.deposit_amount.toLocaleString('vi-VN') : '...'} đ`)
      .moveDown(0.5);
    doc
      .text(`Hợp đồng có giá trị từ ngày ${contractData.start_date ? new Date(contractData.start_date).toLocaleDateString('vi-VN') : '...'} đến ngày ${contractData.end_date ? new Date(contractData.end_date).toLocaleDateString('vi-VN') : '...'}`)
      .moveDown(1.5);
  
    // Trách nhiệm của các bên
    doc
      .font('Roboto')
      .fontSize(12)
      .text('TRÁCH NHIỆM CỦA CÁC BÊN', { align: 'center' })
      .moveDown(0.5);
    doc
      .text('1. Trách nhiệm của Bên A:')
      .text('   - Tạo mọi điều kiện thuận lợi để Bên B thực hiện hợp đồng.')
      .text('   - Cung cấp nguồn điện, nước, wifi cho Bên B sử dụng.')
      .moveDown(0.5);
    doc
      .text('2. Trách nhiệm của Bên B:')
      .text('   - Thanh toán đầy đủ các khoản tiền theo đúng thỏa thuận.')
      .text('   - Bảo quản các trang thiết bị và cơ sở vật chất của Bên A trong suốt thời gian thuê.')
      .text('   - Không được tự ý sửa chữa, thay đổi cơ sở vật chất khi chưa được sự đồng ý của Bên A.')
      .text('   - Giữ gìn vệ sinh chung và ngoài khuôn viên phòng trọ.')
      .moveDown(1);
  
    // Trách nhiệm chung
    doc
      .font('Roboto')
      .fontSize(12)
      .text('TRÁCH NHIỆM CHUNG', { align: 'center' })
      .moveDown(0.5);
    doc
      .text('- Hai bên phải tạo điều kiện cho nhau thực hiện hợp đồng.')
      .text('- Trong thời gian hợp đồng còn hiệu lực, nếu bên nào vi phạm phải chịu trách nhiệm.')
      .text('- Nếu hợp đồng bị đơn phương chấm dứt, bên vi phạm phải bồi thường thiệt hại cho bên còn lại.')
      .text('- Một trong hai bên muốn chấm dứt hợp đồng phải thông báo trước ít nhất 30 ngày.')
      .moveDown(0.5);
    doc
      .text('Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.')
      .moveDown(2);

    doc
    .font('Roboto')
    .fontSize(12)
    .text('ĐẠI DIỆN BÊN A', 50, doc.y, { align: 'left' })
    .text('ĐẠI DIỆN BÊN B', 300, doc.y - 15, { align: 'right' });
  
  // Thêm tên bên dưới chữ ký
  doc
    .moveDown(3) // Tạo khoảng cách để ký tên
    .text(contractData.landlord_name || 'Không xác định', 50, doc.y, { align: 'left' })
    .text(contractData.renter_name || 'Không xác định', 300, doc.y - 15, { align: 'right' });

    // Kết thúc tài liệu
    doc.end();
  
    return pdfPath;
  };
// Hàm gửi mail đính kèm file
const sendContractEmail = async (emailList, pdfPath) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: emailList,
    subject: 'Hợp đồng thuê phòng',
    text: 'Xin chào, đây là HomeNest. Chúng tôi đã gửi đến bạn file hợp đồng thuê phòng. Vui lòng kiểm tra thông tin chi tiết trong file đính kèm và xác nhận giúp chúng tôi. Xin cảm ơn bạn đã tin tưởng lựa chọn HomeNest!',
    attachments: [
      {
        filename: path.basename(pdfPath),
        path: pdfPath
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};

// Hàm xử lý confirm/cancel
const handleContactAction = async (notificationId, action) => {
  try {
    const deposit = await Deposit.findOne({
      where: { notification_id: notificationId },
    });

    if (!deposit) {
      throw new Error("Không tìm thấy thông tin đặt cọc");
    }

    let newStatus;
    if (action === 'confirm') {
      newStatus = 'confirmed';
    } else if (action === 'cancel') {
      newStatus = 'cancelled';
    } else {
      throw new Error("Hành động không hợp lệ");
    }

    await deposit.update({ status: newStatus });

    if (action === 'confirm') {
      const rentPost = await RentPost.findOne({
        where: { id: deposit.post_id },
      });

      if (!rentPost) {
        throw new Error("Không tìm thấy bài đăng thuê liên quan");
      }
      const today = new Date();
      
      const tenantInfo = await User.findOne({
        where: { id: deposit.user_id },
      });
      if (!tenantInfo) {
        throw new Error("Không tìm thấy thông tin người thuê.");
      }

      // Lấy thông tin chủ trọ (landlordInfo) từ user_id của rentPost
      const landlordInfo = await User.findOne({ where: { id: rentPost.user_id } });
      if (!landlordInfo) {
        throw new Error("Không tìm thấy thông tin chủ trọ.");
      }
      const roomInfo = await Room.findOne({ where: { id: rentPost.room_id } });
      if (!roomInfo) {
        throw new Error("Không tìm thấy thông tin phòng.");
      }

      const contractInformation = {
        start_date: rentPost.start_date || new Date(),
        end_date: rentPost.expire_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        address: roomInfo.address || 'Không xác định',
        rental_price: roomInfo.price_per_month || 0,
        deposit_amount: deposit.deposit_amount || 0,
        payment_method: deposit.payment_method || 'Chuyển khoản',
        electricity_price: roomInfo.electricity_price || 4000,
        water_price: roomInfo.water_price || 20000,
        landlord_name: landlordInfo.fullNameIndentify || 'Không xác định',
        landlord_birthday: formatDate(landlordInfo.date_of_birth) || 'Không xác định',
        landlord_address: landlordInfo.address || 'Không xác định',
        landlord_phone: landlordInfo.phone_number || 'Không xác định',
        landlord_id_number: landlordInfo.identifyNumber || 'Không xác định',
        renter_name: tenantInfo.fullNameIndentify || 'Không xác định',
        renter_birthday: tenantInfo.date_of_birth || 'Không xác định',
        renter_birthday: formatDate(tenantInfo.date_of_birth),
        renter_address: tenantInfo.address || 'Không xác định',
        renter_phone: tenantInfo.phone_number || 'Không xác định',
        renter_id_number: tenantInfo.identifyNumber || 'Không xác định',
      };



      const contract = await Contract.create({
        deposit_id: deposit.id,
        post_id: deposit.post_id,
        // start_date: new Date(rentPost.start_date),
        // end_date: new Date(rentPost.expire_date),
        start_date: today,
        end_date: today,
        contract_file: '',
        created_at: new Date(),
      });
       
      const pdfPath = await generateContractPDF(contractInformation);

      await contract.update({
        contract_file: pdfPath,
      });

      const renter = await User.findOne({
        where: { id: deposit.user_id },
      });

      const landlord = await User.findOne({
        where: { id: rentPost.user_id },
      });

      if (!renter || !landlord) {
        throw new Error("Không tìm thấy thông tin người thuê hoặc chủ trọ");
      }

      const emailList = [renter.email, landlord.email];

      await sendContractEmail(emailList, pdfPath);

      console.log("✅ Đã gửi hợp đồng tới email người thuê và chủ trọ.");
    }

    if (action === 'cancel') {
      const refundResult = await processRefund(deposit);
      if (!refundResult.success) {
        throw new Error(`Lỗi khi hoàn tiền: ${refundResult.message}`);
      }
    }

    return {
      success: true,
      message: `Đã ${action === 'confirm' ? 'xác nhận' : 'hủy'} đặt cọc thành công`,
      deposit,
    };
  } catch (error) {
    console.error("❌ Error handling contact action:", error);
    throw error;
  }
};

module.exports = {
  handleContactAction
};
