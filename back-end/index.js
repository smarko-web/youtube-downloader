const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const verifyYoutube = require('./middleware/verifyYoutube');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/convert', verifyYoutube, async (req, res) => {
  const { link, title } = req.body; 
  const { type } = req.query;
  switch (type) {
    case 'video':
      const videoWriteStream = fs.createWriteStream(`${title}.mp4`);
      const video = await ytdl(link, {
        format: 'mp4',
        noCheckCertificate: true,
      }).pipe(videoWriteStream);

      // const file = `${__dirname}/${title}.${type === 'video' ? 'mp4' : 'mp3'}`;
       
      res.status(200).json({ msg: 'downloaded video', data: { video } });
      break;
    case 'audio':
      const audioWriteStream = fs.createWriteStream(`${title}.mp3`);
      const audio = await ytdl(link, {
        format: 'mp3',
        noCheckCertificate: true,
      }).pipe(audioWriteStream);
      res.status(200).json({ msg: 'downloaded audio', data: { audio } });
      break;
    default:
      res.status(200).json({ msg: 'this format is not supported' });
      break;
  }
 
  // const videoWriteStream = fs.createWriteStream(`${title}.mp4`);
  // const audioWriteStream = fs.createWriteStream(`${title}.mp3`);

  // const video = await ytdl(link, {
  //   format: 'mp4',
  //   noCheckCertificate: true,
  // }).pipe(videoWriteStream);

  // const audio = await ytdl(link, {
  //   format: 'mp3',
  //   noCheckCertificate: true,
  // }).pipe(audioWriteStream);


  // res.status(200).json({ msg: 'downloaded', data: { video } });
});

app.get('/downloadFile', (req, res) => {
  // const { title } = req.body;
  const { title, type } = req.query;
  // const file = `${__dirname}/${title}.${type === "video" ? "mp4" : "mp3"}`;
  // const file = `${__dirname}/video.mp4`;
  // console.log(file);
  const files = fs.readdirSync(__dirname);
  const downloadedFile = files.find((file) => {
    // return the first files that include given entry
    return file.includes('.mp4') || file.includes('.mp3');
  });
  var stats = fs.statSync(downloadedFile);
  var fileSizeInBytes = stats.size;
  console.log(`${downloadedFile} is ${fileSizeInBytes} bytes in your server! `);
  res.download(downloadedFile, `${downloadedFile.includes('mp4') ? 'video.mp4' : 'audio.mp3'}`, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`"${downloadedFile}" : file sent to client`);
    }
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server is live on http://localhost:${port}`);
});