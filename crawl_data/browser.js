const puperteer = require('puppeteer');

const startBrowser =  async() => {
    let browser
    try{
    // Hàm có sẵn để khởi tạo browser 
    browser = await puperteer.launch({
        headless: true,
        //Chrome sử dụng miltiple để tránh nội dung không đáng tin cậy, nếu muốn dùng cho tất cả các trang thì set như dòng bên dướidưới
        args: ['--disable-setuid-sandbox'],
        'ignoreHTTPSErrors': true
    })
    
    }catch(err){
        console.log('Không tạo được browser', err)
    }
    return browser
}

module.exports = startBrowser