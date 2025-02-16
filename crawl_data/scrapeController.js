// scrapeController.js
const scrapers = require('./scraper'); // Đường dẫn cần đúng
const fs = require('fs');
const scrapeController = async (browserInstance) => {
  const url = 'https://phongtro123.com/';
  const urlHanoi= 'https://phongtro123.com/tinh-thanh/ha-noi'
  const urlHanoi2 ='https://phongtro123.com/cho-thue-nha-nguyen-can-ha-noi'
  const urlHanoi3 ='https://phongtro123.com/cho-thue-can-ho-chung-cu-ha-noi'
  const urlHanoi4='https://phongtro123.com/cho-thue-can-ho-chung-cu-mini-ha-noi'
  const urlHanoi5='https://phongtro123.com/cho-thue-can-ho-dich-vu-ha-noi'
  const indexs = [1,2,3,4]
  try {
    //browserInstance giúp mở trang web và điều khiển trên đóđó
    let browser = await browserInstance;
    // Gọi đúng tên hàm
    const categories = await scrapers.scrapeCategory(browser, url);
    const selectCategory = categories.filter((category, index) => indexs.some(i => i === index));
    let result1 = await scrapers.scraper(browser, urlHanoi);
    fs.writeFileSync('./crawl_data/dataphongtro.json', JSON.stringify(result1),(err) => {
      if (err) {
        console.log(err);
      }
    }
    );
    // let result2 = await scrapers.scraper(browser, urlHanoi2);
    // fs.writeFileSync('datanhanguyencan.json', JSON.stringify(result2),(err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    // }
    // );
    // let result3 = await scrapers.scraper(browser, urlHanoi3);
    // fs.writeFileSync('datachungcu.json', JSON.stringify(result3),(err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    // }
    // );
    // let result4 = await scrapers.scraper(browser, urlHanoi4);
    // fs.writeFileSync('datachungcumini.json', JSON.stringify(result4),(err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    // }
    // );
    // let result5 = await scrapers.scraper(browser, urlHanoi5);
    // fs.writeFileSync('datacanhodichvu.json', JSON.stringify(result5),(err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    // }
    // );

  } catch (err) {
    console.log('Lỗi ở scrape controller', err);
  }
};


 
module.exports = scrapeController;
