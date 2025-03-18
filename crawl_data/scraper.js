// scraper.js
const scrapeCategory = (browser, url) =>
    new Promise(async (resolve, reject) => {
      try {
        let page = await browser.newPage();
        console.log(`Đang scrape ${url}`);
        await page.goto(url);
        console.log('Đã đến trang');
        await page.waitForSelector('#webpage');
        console.log('Đã load xong');
        const dataCategory = await page.$$eval('nav.pt123__nav > ul.d-flex.h-100 > li', els =>{
            dataCategory=els.map(el => {
              return {
                category: el.querySelector('a').innerText,
                link: el.querySelector('a').href
              };
            })
            return dataCategory;
      });
        await page.close();
        resolve(dataCategory);
      } catch (err) {
        console.log('Lỗi ở scrapeCategory', err);
        reject(err);
      }
    });
  
  // Lay data cua tung trang
  const scraper = (browser, urlHanoi) =>
    new Promise(async (resolve, reject) => {
        try {
            let newPage = await browser.newPage();
            console.log(`Đang scrape ${urlHanoi}`);
            await newPage.goto(urlHanoi);
            console.log('Đã đến trang');
            await newPage.waitForSelector('.row');
            console.log('Đã load xong');
          
            // Lấy item 
            await newPage.waitForSelector('ul.post__listing > li'); // Chờ cho phần tử có mặt
            const detailLinks = await newPage.$$eval('ul.post__listing > li', els => {
                return els.map(el => {
                    // Sử dụng selector chính xác để lấy thẻ <a>
                    const linkElement = el.querySelector('.flex-grow-1.ps-3 > h3 > a.line-clamp-2'); // Thêm class để chính xác hơn
                    return {
                        linkDetails: linkElement ? linkElement.href : null // Kiểm tra null trước khi truy cập href
                    };
                });
            });

            const scraperDetail = async (link) => {
                return new Promise(async (resolve, reject) => {
                    try {
                        if (!link || typeof link !== 'string') {
                            throw new Error(`Invalid link: ${link}`); // Kiểm tra xem link có hợp lệ không
                        }
                        let pageDetails = await browser.newPage();
                        await pageDetails.goto(link, { waitUntil: 'networkidle2', timeout: 60000 }); // Tăng timeout lên 60 giây
                        await pageDetails.waitForSelector('#webpage');
                         
                        const detailData ={}

                        // Thực hiện các thao tác scrape ở đây (nếu cần)
                        // await pageDetails.waitForSelector('#carousel_Photos .carousel-indicators button img.size-60.lazy_done');
                        // const room_images = await pageDetails.$$eval(
                        //   '#carousel_Photos .carousel-indicators button img.size-60.lazy_done',
                        //   (images) => images.map(img => img.src) // Lấy danh sách src của tất cả ảnh trong button
                        // );
                        
                        const room_images = await pageDetails.$$eval('#carousel_Photos .carousel-indicators button', (els) => {
                            return els.map(el => {
                                const imgElement = el.querySelector('img');
                                return imgElement ? imgElement.getAttribute('data-src') : null // Lấy data-src thay vì src
                            });
                        });
                      detailData.room_images = room_images;
                      //  header cua detail
                      const headerDetail = await pageDetails.$$eval('div.row.mt-3 > div.col-md-9.col-lg-8 > div.bg-white.shadow-sm.rounded.p-4.mb-3 > header', (els) => {
                        return els.map(el => {
                            return {
                                room_name: el.querySelector('h1')?.innerText || '', // Sử dụng optional chaining
                                address: el.querySelector('address')?.innerText || '', // Sửa lỗi cú pháp
                                rating: el.querySelector('div.badge.d-inline-flex.align-items-center.fs-11.fw-normal.text-uppercase.mb-1 > div')?.className.match(/star-(\d+)/)?.[1] || '',
                                price_per_month: el.querySelector('div.d-flex.justify-content-between > div.d-flex > span')?.innerText || '', // Sử dụng optional chaining
                                area: el.querySelectorAll('div.d-flex.justify-content-between > div.d-flex > span')[2]?.innerText || ''

                            };
                        });
                    });
                    const firstDetail = headerDetail[0] || {};

                    // Gán từng giá trị vào detailData
                    detailData.room_name = firstDetail.room_name;
                    detailData.address = firstDetail.address;
                    detailData.rating = firstDetail.rating;
                    detailData.price_per_month = firstDetail.price_per_month;
                    detailData.area = firstDetail.area;
                    // Thong tin mo ta
                    const description = await pageDetails.$$eval(
                        'div.row.mt-3 > div.col-md-9.col-lg-8 > div.bg-white.shadow-sm.rounded.p-4.mb-3 > div.border-bottom.pb-3.mb-4 >p',
                        (els) => 
                             els.map(el=>el.innerText)
                                    
                    );
                    detailData.description = description;

                    

                    // Thông tin liên hệ
                    // const contactData = await pageDetails.$$eval(
                    //     'div.row.mt-3 > div.col-md-9.col-lg-8 > div.bg-white.shadow-sm.rounded.p-4.mb-3 > div.mb-4',
                    //     (els) => {
                    //         return els
                    //             .map((el) => ({
                    //                 imageAcc: el.querySelector('div.d-flex > img')?.src || '', // Lấy đường dẫn hình ảnh
                    //                 nameAcc: el.querySelector('div.ms-3 > div.d-flex > div.fs-5-5.fw-medium.me-2')?.innerText || '', // Tên tài khoản
                    //                 phoneAcc: el.querySelector('div.ms-3 > div.d-flex.mt-3 > a.btn.btn-green.text-white.d-flex.justify-content-center.rounded-4')?.innerText || '', // Số điện thoại
                    //                 zaloAcc: el.querySelector('div.ms-3 > div.d-flex.mt-3 > a.btn.btn-primary.text-white.d-flex.justify-content-center.ms-2.rounded-4')?.href || '', // Zalo (sử dụng href thay vì link)
                    //             }))
                    //             .filter((item) => item.imageAcc || item.nameAcc || item.phoneAcc || item.zaloAcc); // Lọc bỏ object rỗng
                    //     }
                    // );
                    
                    // detailData.contactData = contactData;
                   // thông tin về thời gian đăng bài 
                   
                    const createdAt  = await pageDetails.$$eval(
                        'div.row.mt-3 > div.col-md-9.col-lg-8 > div.bg-white.shadow-sm.rounded.p-4.mb-3 > div.border-bottom.pb-4.mb-4 >div > div.col-6 > div  > span.ms-2',
                        (els) => 
                            els.map(el=>el.innerText)
                    )
                    detailData.createdAt = createdAt;

                        await pageDetails.close(); // Đóng tab
                        console.log('Đã xong');
                        resolve(detailData);
                    } catch (err) {
                        console.log('Lỗi ở scraperDetail', err);
                        reject(err);
                    }
                });
            };
             const details =[]
            // Sử dụng await để đợi kết quả từ scraperDetail
            for (let link of detailLinks) {
                try {
                    const detail = await scraperDetail(link.linkDetails); // Truyền link.linkDetails vào scraperDetail
                    details.push(detail);
                } catch (error) {
                    console.error(`Lỗi khi scrape ${link.linkDetails}:`, error);
                }
            }
            

            await newPage.close(); // Đóng newPage
            console.log('Đã scrape xong');
            resolve(details); // Trả về detailLinks nếu cần
        } catch (err) {
            console.log('Lỗi ở scrapePage', err);
            reject(err);
        }
    });

module.exports = { 
    scrapeCategory,
    scraper 
};