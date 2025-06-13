// // scrapeController.js
// const scrapers = require('./scraper'); // Đường dẫn cần đúng
// const fs = require('fs');
// const scrapeController = async (browserInstance) => {
//   const url = 'https://phongtro123.com/';
//   const urlHanoi= 'https://phongtro123.com/?page=2'
//   const urlHanoi2 ='https://phongtro123.com/nha-cho-thue'
//   const urlHanoi3 ='https://phongtro123.com/cho-thue-can-ho'
//   const urlHanoi4='https://phongtro123.com/cho-thue-can-ho-chung-cu-mini'
//   const urlHanoi5='https://phongtro123.com/cho-thue-can-ho-dich-vu'
//   const indexs = [1,2,3,4]
//   try {
//     //browserInstance giúp mở trang web và điều khiển trên đóđó
//     let browser = await browserInstance;
//     // Gọi đúng tên hàm
//     const categories = await scrapers.scrapeCategory(browser, url);
//     const selectCategory = categories.filter((category, index) => indexs.some(i => i === index));
//        let result1 = await scrapers.scraper(browser, selectCategory[0].link);
//        fs.writeFileSync('./crawl_data/dataphongtro.json', JSON.stringify(result1),(err) => {
//        if (err) {
//         console.log(err);
//      }
//     }
//     );
//     // let result2 = await scrapers.scraper(browser, urlHanoi2);
//     // fs.writeFileSync('./crawl_data/datanhanguyencan.json', JSON.stringify(result2),(err) => {
//     //   if (err) {
//     //     console.log(err);
//     //   }
//     // }
//     // );
//     // let result3 = await scrapers.scraper(browser, urlHanoi3);
//     // fs.writeFileSync('./crawl_data/datachungcu.json', JSON.stringify(result3),(err) => {
//     //   if (err) {
//     //     console.log(err);
//     //   }
//     // }
//     // );
//     // let result4 = await scrapers.scraper(browser, urlHanoi4);
//     // fs.writeFileSync('./crawl_data/datachungcumini.json', JSON.stringify(result4),(err) => {
//     //   if (err) {
//     //     console.log(err);
//     //   }
//     // }
//     // );
//     // let result5 = await scrapers.scraper(browser, urlHanoi5);
//     // fs.writeFileSync('./crawl_data/datacanhodichvu.json', JSON.stringify(result5),(err) => {
//     //   if (err) {
//     //     console.log(err);
//     //   }
//     // }
//     // );

//   } catch (err) {
//     console.log('Lỗi ở scrape controller', err);
//   }
// };


 
// module.exports = scrapeController;
const scrapers = require('./scraper'); // Đường dẫn cần đúng
const fs = require('fs');
const path = require('path');

const scrapeController = async (browserInstance) => {
  const baseUrl = 'https://phongtro123.com/cho-thue-can-ho?page=';
  const startPage = 0;
  const endPage = 5;
  // const totalPages = 500// Số trang bạn muốn crawl
  const allResults = [];

  try {
    const browser = await browserInstance;

      for (let page = startPage; page <= endPage; page++) 

       {
      const pageUrl = `${baseUrl}${page}`;
      console.log(`Đang crawl trang: ${pageUrl}`);
      try {
        const result = await scrapers.scraper(browser, pageUrl);
        allResults.push(...result); // Gộp dữ liệu từ từng trang vào mảng tổng
      } catch (err) {
        console.log(`❌ Lỗi khi crawl trang ${pageUrl}:`, err.message);
        continue; // Bỏ qua trang lỗi và tiếp tục
      }
    }

    // Ghi dữ liệu vào file JSON sau khi hoàn tất
    const outputPath = path.join(__dirname, './datachungcu.json');
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf-8');
    console.log(`✅ Đã lưu dữ liệu vào ${outputPath}`);
  } catch (err) {
    console.log('❌ Lỗi ở scrapeController:', err.message);
  }
};

module.exports = scrapeController;
