const fs = require('fs');
const axios = require('axios');

// Load file JSON gốc
const data = JSON.parse(fs.readFileSync('datachungcu.json', 'utf-8'));

async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'phongtro-app/1.0' } // Nominatim yêu cầu có user-agent
        });

        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        } else {
            return { latitude: null, longitude: null };
        }
    } catch (error) {
        console.error(`Lỗi khi geocode địa chỉ: ${address}`, error.message);
        return { latitude: null, longitude: null };
    }
}

async function addCoordinatesToRooms() {
    for (const room of data) {
        const coords = await geocodeAddress(room.address);
        room.latitude = coords.latitude;
        room.longitude = coords.longitude;
        console.log(`Đã geocode: ${room.address} =>`, coords);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1 giây để tránh bị chặn
    }

    // Ghi kết quả ra file mới
    fs.writeFileSync('datachungcu.json', JSON.stringify(data, null, 2), 'utf-8');
}

addCoordinatesToRooms();
