const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());


app.post('/search', async (req, res) => {
    const {link} = req.body;
    if (!link || link === '') {
        return res.status(200).json({ msg: 'please enter a link' });
    }

    let url;

    try {
        url = new URL(link);

        const resEx =
        /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

        if (!link.match(resEx)) {
            return res.status(200).json({ msg: 'please enter a youtube link' });
        }

    } catch (_) {
        return res.status(200).json({ msg: 'please enter a valid link' });
    }

    // res.header('Content-Type', formats[0].mimeType); // Setting the mime type of the video
    // ytdl(videoUrl, { format: formats[0] }).pipe(res);
    const writeableStream = fs.createWriteStream('video.mp4');

    const video = await ytdl(link, {
        format: 'mp4',
        noCheckCertificate: true,
    }).pipe(fs.createWriteStream('video.mp4')); 
    
    // Listening for the 'finish' event
    writeableStream.on('finish', () => {
      console.log('downloaded complited');
    });
    res.status(200).json({msg: 'success', video});
    
    // console.log(searchTerm);
    // if (!searchTerm) {
    //     res.status(204).json({ msg: 'Please enter a search term' });
    // }
    // const videoResults = await

    // res.status(200).json({msg: 'success', results: videoResults});
})



const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`server is live on http://localhost:${port}`);
});