const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const verifyYoutube = require('./middleware/verifyYoutube');
const app = express();

app.use(
  cors({
    origin: process.env.FRONT_END_URL || 'http://localhost:5173', // your frontend URL
    methods: ['GET', 'POST'],
  })
);
app.use(express.json());

let clients = [];
const sendProgress = (message) => {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify({ message })}\n\n`);
  });
};

const downloadAndSave = (link, filePath, ytdlOptions, onProgress) => {
  return new Promise((resolve, reject) => {
    const stream = ytdl(link, ytdlOptions);

    let downloaded = 0;
    let total = 0;

    stream.on('response', (res) => {
      total = parseInt(res.headers['content-length'], 10);
    });

    stream.on('data', (chunk) => {
      downloaded += chunk.length;
      if (total && typeof onProgress === 'function') {
        const percent = ((downloaded / total) * 100).toFixed(2);
        onProgress(percent);
      }
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
      reject(err);
    });

    const writeStream = fs.createWriteStream(filePath);

    stream.pipe(writeStream);

    writeStream.on('finish', () => {
      resolve();
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
};

const downloadVideoWithAudio = async (videoURL, outputFile) => {
  const tempVideo = 'temp_video.mp4';
  const tempAudio = 'temp_audio.mp4';

  try {
    await downloadAndSave(
      videoURL,
      tempVideo,
      { quality: 'highestvideo' },
      (percent) => {
        sendProgress(`Downloading video: ${percent}%`);
      }
    );

    await downloadAndSave(
      videoURL,
      tempAudio,
      { quality: 'highestaudio' },
      (percent) => {
        sendProgress(`Downloading audio: ${percent}%`);
      }
    );

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(tempVideo)
        .input(tempAudio)
        .outputOptions('-c:v copy')
        .outputOptions('-c:a aac')
        .save(outputFile)
        .on('progress', (progress) => {
          const percent = Math.min(progress.percent || 0, 100).toFixed(2);
          sendProgress(`Merging: ${percent}%`);
        })
        .on('end', () => {
          sendProgress('✅ Merge complete');
          resolve();
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg error:', err);
          reject(err);
        });
    });
  } catch (err) {
    console.error('Download or merge failed:', err);
  } finally {
    [tempVideo, tempAudio].forEach((file) => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  }
};

app.post('/getInfo', verifyYoutube, async (req, res) => {
  const { link } = req.body;
  
  try {
    const {videoDetails} = await ytdl.getBasicInfo(link);
    const { title, lengthSeconds, chapters } = videoDetails;


    res.status(200).json({
      msg: 'Video info fetched successfully',
      info: { title, lengthSeconds, chapters },
      // info: { videoDetails },
    });
  } catch (err) {
    console.error('Error fetching video info:', err);
    res.status(500).json({ msg: 'Failed to fetch video info', error: err.message });
  }
});

app.post('/convert', verifyYoutube, async (req, res) => {
  const { link, title } = req.body; 
  const { type } = req.query;

  if (!title) {
    return res.status(400).json({ msg: 'Please provide a title' });
  }
  if (!type) {
    return res.status(400).json({ msg: 'Please provide a conversion type' });
  }

  const fileName = `${title}.${type === 'video' ? 'mp4' : 'mp3'}`;

  fs.mkdirSync('./downloads', {recursive: true}, (error) => {
    if (error) {
      return console.error(error);
    }
    console.log('folder created');
  });

  const filePath = path.join(`${__dirname}/downloads`, fileName);

 try {
   console.log(`[INFO] Starting download for: ${link}`);

   if (type === 'video') {
     await downloadVideoWithAudio(link, filePath);
   } else {
     await downloadAndSave(link, filePath, { filter: 'audioonly' });
   }

   res.status(200).json({
     msg: `Downloaded ${type}`,
     fileName,
   });
 } catch (err) {
   console.error('[ERROR] Download failed:', err);
   res.status(500).json({ msg: 'Download failed', error: err.message });
 }


});

app.get('/downloadFile', async(req, res) => {
  const { title, type } = req.query;
  if (!title || !type) return res.status(400).send('Missing title or type');

  const fileName = `${title}.${type === 'video' ? 'mp4' : 'mp3'}`;
  const filePath = path.join(`${__dirname}/downloads`, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error('Download error:', err);
    } else {
      console.log(`"${fileName}" sent to client`);
      fs.rm('./downloads', { recursive: true, force: true }, (err) => {
        if (err) {
          console.error('Error deleting folder:', err);
        } else {
          console.log('Folder and contents deleted successfully');
        }
      });
    }
  });
  
});

app.get('/progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter((client) => client !== res);
  });
});



const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server is live on http://localhost:${port}`);
});