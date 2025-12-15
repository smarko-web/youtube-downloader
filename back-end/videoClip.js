const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

/**
 * Trims a media file and deletes the original.
 * @param {string} inputPath - Path to the original media file.
 * @param {number} start - Start time in seconds.
 * @param {number} end - End time in seconds.
 * @returns {Promise<string>} - Path to the trimmed file.
 */
const clipDownload = (inputPath, start, end) => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(inputPath);
    const baseName = path.basename(inputPath, ext);
    const outputPath = path.join(
      path.dirname(inputPath),
      `${baseName}_clipped${ext}`
    );

    const duration = end - start;

    if (duration <= 0) {
      return reject(new Error('End time must be greater than start time.'));
    }

    ffmpeg(inputPath)
      .setStartTime(start)
      .setDuration(duration)
      .output(outputPath)
      .on('end', () => {
        console.log(`✅ Clipped ${ext === 'mp3' ? 'audio' : 'video'} file created at: ${outputPath}`);

        // Delete the original file
        fs.unlink(inputPath, (err) => {
          if (err) {
            console.error(
              `⚠️ Failed to delete original file: ${inputPath}`,
              err
            );
          } else {
            console.log(`🗑️ Original file deleted: ${inputPath}`);
          }
          resolve(outputPath);
        });
      })
      .on('error', (err) => {
        console.error('❌ FFmpeg error during trim:', err.message);
        reject(err);
      })
      .run();
  });
};

(async () => {
  try {
    const clippedFilePath = await clipDownload(
      './downloads/video.mp4',
      10,
      30
    ); // from 10s to 30s
    console.log('clipped file saved at:', clippedFilePath);
  } catch (err) {
    console.error('Error trimming media:', err.message);
  }
})();

