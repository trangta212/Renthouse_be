// require('dotenv').config(); // NHỚ load .env ở đầu file

const { Deposit, Notification, Contract, RentPost, User, Room } = require('../models');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const db = require('../models');
const { uploadToCloudinary } = require('../utils/cloudinary');
const {findNotificationById,markNotificationAsRead} = require('../queries/notificationQuery')

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
    // Tạo tên file duy nhất
    const timestamp = Date.now();
    const pdfPath = path.join(__dirname, `../contracts/contract_${timestamp}.pdf`);
    
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
      .text(`CCCD số: ${contractData.landlord_id_number || '...'} cấp ngày ${contractData.cccd_date_landlord 
        ? new Date(contractData.cccd_date_landlord).toLocaleDateString('vi-VN') 
        : '...'} tại: Cục Cảnh sát Quản lý hành chính về trật tự xã hội`)
      .text(`Số điện thoại: 0${contractData.landlord_phone || '...'}`)
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
      .text(`CCCD số: ${contractData.renter_id_number || '...'} cấp ngày ${contractData.cccd_date_tenant 
        ? new Date(contractData.cccd_date_tenant).toLocaleDateString('vi-VN') 
        : '...'} tại: Cục Cảnh sát Quản lý hành chính về trật tự xã hội`)
      .text(`Số điện thoại: 0${contractData.renter_phone || '...'}`)
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
          ? (parseFloat(String(contractData.rental_price).replace(',', '.')) ).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) 
          : '...'
      } đ/tháng`)
      .text(`Hình thức thanh toán: ${contractData.payment_method || 'Chuyển khoản'}`)
      .moveDown(0.5);
    doc
    .text(`Tiền điện: ${contractData.electricity_bill != null 
      ? `${contractData.electricity_bill.toLocaleString('vi-VN')} đ/kWh` 
      : 'không có'}, thanh toán vào cuối tháng`)
    
    .text(`Tiền nước: ${contractData.water_bill != null 
      ? `${contractData.water_bill.toLocaleString('vi-VN')} đ/người` 
      : 'không có'}, thanh toán vào đầu tháng`)
    
      .moveDown(0.5);
    doc
      .text(`Tiền đặt cọc: ${contractData.deposit_amount ? contractData.deposit_amount.toLocaleString('vi-VN') : '...'} đ`)
      .moveDown(0.5);
    doc
      .text(`Hợp đồng có giá trị từ ngày ${contractData.start_date_contract ? new Date(contractData.start_date_contract).toLocaleDateString('vi-VN') : '...'} đến ngày ${contractData.end_date_contract? new Date(contractData.end_date_contract).toLocaleDateString('vi-VN') : '...'}`)
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
      .text('   - Bảo quản các trang thiết bị và cơ sở vật chất của bên A trong suốt thời gian thuê.(làm hỏng phải sửa, mất phải đền).')
      .text('   - Không được tự ý sửa chữa, thay đổi cơ sở vật chất khi chưa được sự đồng ý của bên A.')
      .text('   - Giữ gìn vệ sinh chung và ngoài khuôn viên phòng trọ.')
      .text('   - Bên B phải chấp hành mọi quy định của pháp luật Nhà nước và quy định của địa phương.')
      .text('   - Nếu bên B cho khách ở qua đêm thì phải báo trước và được sự đồng ý của bên A, đồng thời phải chịu trách nhiệm về các hành vi vi phạm pháp luật của khách trong thời gian ở lại (nếu có).')
      .moveDown(1);
  
    // Trách nhiệm chung
    doc
      .font('Roboto')
      .fontSize(12)
      .text('TRÁCH NHIỆM CHUNG', { align: 'center' })
      .moveDown(0.5);
    doc
      .text('- Hai bên phải tạo điều kiện cho nhau thực hiện hợp đồng.')
      .text('- Nếu một trong hai bên vi phạm hợp đồng trong thời gian hợp đồng vẫn còn hiệu lực thì bên còn lại có quyền đơn phương chấm dứt hợp đồng thuê nhà trọ. Ngoài ra, nếu hành vi vi phạm đó gây tổn thất cho bên bị vi phạm thì bên vi phạm sẽ phải bồi thường mọi thiệt hại đã gây ra.')
      .text('- Trong trường hợp muốn chấm dứt hợp đồng trước thời hạn, cần phải báo trước cho bên kia ít nhất 30 ngày và hai bên phải có sự thống nhất với nhau. ')
      .text('- Kết thúc hợp đồng, Bên A phải trả lại đầy đủ tiền đặt cọc cho bên B.')
      .text('- Bên nào vi phạm các điều khoản chung thì phải chịu trách nhiệm trước pháp luật.')
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

    // Đợi file được ghi xong
    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
    });

    // Upload file lên Cloudinary
    const uploadResult = await uploadToCloudinary(pdfPath);
    if (!uploadResult.success) {
      throw new Error(`Lỗi khi upload file lên Cloudinary: ${uploadResult.message}`);
    }
  
    return uploadResult.url;
};
// Hàm gửi mail đính kèm file
const sendContractEmail = async (emailList, cloudinaryUrl) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: emailList,
      subject: 'Hợp đồng thuê phòng',
      text: 'Xin chào, đây là HomeNest. Chúng tôi đã gửi đến bạn file hợp đồng thuê phòng. Vui lòng kiểm tra thông tin chi tiết trong file đính kèm và xác nhận giúp chúng tôi. Xin cảm ơn bạn đã tin tưởng lựa chọn HomeNest!',
      attachments: [
        {
          filename: 'hop_dong_thue_phong.pdf',
          path: cloudinaryUrl
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Hàm xử lý confirm/cancel
const handleContactAction = async (notificationId, action) => {

  const notification = await findNotificationById(notificationId);
  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification không tồn tại." });
  }
  await markNotificationAsRead(notification);
  try {
    const deposit = await Deposit.findOne({
      where: { id: notification.deposit_id },
      attributes: [
        'id', 
        'user_id', 
        'post_id', 
        'deposit_amount', 
        'deposit_day', 
        'status', 
        'created_at', 
        'updated_at', 
        'notification_id', 
        'payment_method', 
        'trans_id', 
        'refund_status', 
        'refund_reason', 
        'partnerCode'
      ]
    });

    if (!deposit) {
      throw new Error("Không tìm thấy thông tin đặt cọc");
    }

    let newStatus;
    let messageNotification;
    if (action === 'confirm') {
      newStatus = 'confirmed';
      messageNotification = 'Hợp đồng đã được thiết lập';
    } else if (action === 'cancel') {
      newStatus = 'cancelled';
      messageNotification = 'Phòng đã được hủy';
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
      if(rentPost) {
          await rentPost.update({ status: 'cancel' });
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
      const utilitiesInfo = await db.Utilities.findOne({
        where: { id: roomInfo.utilities_id },
      }) || {
        electricity_bill: 4000,
        water_price: 20000,
        extensions: 0,
        full_furnising: 0,
      };
      
      const contractInformation = {
        start_date: rentPost.start_date || new Date(),
        end_date: rentPost.expire_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        address: roomInfo.address || 'Không xác định',
        rental_price: roomInfo.price_per_month || 0,
        deposit_amount: deposit.deposit_amount || 0,
        payment_method: deposit.payment_method || 'Chuyển khoản',
        electricity_bill: utilitiesInfo.electricity_bill || 4000,
        water_bill: utilitiesInfo.water_price || 20000,
        extensions: utilitiesInfo.extensions || 0,
        full_furnising: utilitiesInfo.full_furnising || 0,
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
        start_date_contract: rentPost.start_date_contract || 'Không xác định',
        end_date_contract: rentPost.end_date_contract || " Không xác định",
        cccd_date_landlord:landlordInfo.date_cccd || "Không xác định",
        cccd_date_tenant:tenantInfo.date_cccd || "Không xác định"
      };

      const contract = await Contract.create({
        deposit_id: deposit.id,
        post_id: deposit.post_id,
        start_date: today,
        end_date: today,
        contract_file: '',
        created_at: new Date(),
      });
       
      const pdfUrl = await generateContractPDF(contractInformation);

      await contract.update({
        contract_file: pdfUrl,
      });

      const renter = await User.findOne({
        where: { id: deposit.user_id },
      });

      const landlord = await User.findOne({
        where: { id: rentPost.user_id },
      });
    
      // Tạo thông báo mới cho chủ trọ
      await Notification.create({
        message: action === 'confirm' ? 
          "Người thuê đã đồng ý xác nhận hợp đồng thuê phòng. Vui lòng kiểm tra email để xem chi tiết hợp đồng. Tiền đặt cọc sẽ được chuyển đến bạn." : 
          "Người thuê đã hủy đặt cọc. Tiền đặt cọc sẽ được hoàn trả cho người thuê và bài đăng của bạn sẽ được hiển thị trở lại.",
        type: action === 'confirm' ? 'contract_landlord' : 'contract_renter_cancel',
        room_id: notification.room_id,
        user_id: landlord.id,
        created_at: new Date(),
        updated_at: new Date(),
        is_read: false,
        time: new Date(),
        deposit_id: deposit.id
      });
  
      if (!renter || !landlord) {
        throw new Error("Không tìm thấy thông tin người thuê hoặc chủ trọ");
      }

      const emailList = [renter.email, landlord.email];

      await sendContractEmail(emailList, pdfUrl);

      console.log("✅ Đã gửi hợp đồng tới email người thuê và chủ trọ.");
      
    }

    if (action === 'cancel') {
      const rentPost = await RentPost.findOne({
        where: { id: deposit.post_id },
      });

      if (!rentPost) {
        throw new Error("Không tìm thấy bài đăng thuê liên quan");
      }
      if(rentPost) {
          await rentPost.update({ status: 'pending' });
        }
        const landlord = await User.findOne({
          where: { id: rentPost.user_id },
        });
        if (landlord) {
          await Notification.create({
            message: "Người thuê đã hủy đặt cọc. Tiền đặt cọc sẽ được chuyển cho bạn và bài đăng của bạn sẽ được hiển thị trở lại.",
            type: 'contract_renter_cancel',
            room_id: notification.room_id,
            user_id: landlord.id,
            created_at: new Date(),
            updated_at: new Date(),
            is_read: false,
            time: new Date(),
            deposit_id: deposit.id
          });
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

const getContractList = async (userId) => {
  try {
    // Tìm tất cả hợp đồng liên quan đến user (cả người thuê và chủ trọ)
    const contracts = await Contract.findAll({
      include: [
        {
          model: Deposit,
          as: 'deposit',
          required: true,
          attributes: ['id', 'user_id', 'post_id', 'status', 'created_at'],
          include: [
            {
              model: RentPost,
              as: 'rentPost',
              required: true,
              attributes: [
                'start_date_contract',
                'end_date_contract'
                // 👉 Thêm các trường bạn cần ở đây
              ],
              include: [
                {
                  model: User,
                  attributes: ['id', 'fullNameIndentify', 'email', 'phone_number']
                },
                {
                  model: Room,
                  attributes: ['id', 'room_name', 'address', 'price_per_month']
                }
              ]
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullNameIndentify', 'email', 'phone_number']
            }
          ]
        }
      ]
    });

    // Lọc các hợp đồng liên quan đến user
    const userContracts = contracts.filter(contract => {
      const isRenter = contract.deposit?.user_id === userId;
      const isLandlord = contract.deposit?.rentPost?.user_id === userId;
      return isRenter || isLandlord;
    });

    // Format dữ liệu trả về
    const formattedContracts = userContracts.map(contract => {
      const isRenter = contract.deposit?.user_id === userId;
      const room = contract.deposit?.rentPost?.Room;
      const landlord = contract.deposit?.rentPost?.User;
      const renter = contract.deposit?.user;
      const start_date_contract = contract.deposit?.rentPost?.start_date_contract;
      const end_date_contract = contract.deposit?.rentPost?.end_date_contract;


      return {
        contract_id: contract.id,
        contract_file: contract.contract_file,
        start_date: contract.start_date,
        end_date: contract.end_date,
        start_date_contract: start_date_contract 
          ? new Date(start_date_contract).toLocaleDateString('vi-VN') 
          : null,
          end_date_contract: end_date_contract 
          ? new Date(end_date_contract).toLocaleDateString('vi-VN') 
          : null,
        created_at: contract.created_at,
        role: isRenter ? 'renter' : 'landlord',
        room_info: {
          room_name: room?.room_name || 'Không xác định',
          address: room?.address || 'Không xác định',
          price_per_month: room?.price_per_month || 0
        },
        other_party: {
          name: isRenter 
            ? landlord?.fullNameIndentify || 'Không xác định'
            : renter?.fullNameIndentify || 'Không xác định',
          email: isRenter 
            ? landlord?.email || 'Không xác định'
            : renter?.email || 'Không xác định',
          phone: isRenter 
            ? landlord?.phone_number || 'Không xác định'
            : renter?.phone_number || 'Không xác định'
        }
      };
    });
    const today = new Date();
    const totalContracts = formattedContracts.length;
    const expiredContracts = formattedContracts.filter(
      c => c.end_date_contract && new Date(c.end_date_contract.split('/').reverse().join('-')) < today
    ).length;
    const activeContracts = formattedContracts.filter(
      c => c.end_date_contract && new Date(c.end_date_contract.split('/').reverse().join('-')) >= today
    ).length;
    
    return {
      success: true,
      data: formattedContracts,
      totalContracts,
      expiredContracts,
      activeContracts
    };
  } catch (error) {
    console.error("Error getting contract list:", error);
    return {
      success: false,
      message: error.message
    };
  }
};

module.exports = {
  handleContactAction,
  getContractList
};
