const fs = require('fs');
const https = require('https');
const path = require('path');

const targetPath = path.join(__dirname, 'public', 'images', 'delivery-animation.json');

// Using an alternative reliable Lottie JSON source for a delivery truck
const url = 'https://assets2.lottiefiles.com/packages/lf20_jmejybvu.json'; 

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to get '${url}' (${res.statusCode})`);
    res.resume();
    return;
  }
  const file = fs.createWriteStream(targetPath);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Animation JSON downloaded successfully at ' + targetPath);
  });
}).on('error', (err) => {
  console.error('Error downloading:', err.message);
});
