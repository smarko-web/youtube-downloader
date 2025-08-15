# YouTube Downloader Backend

This Express.js server provides endpoints to convert and download YouTube videos or audio files. It uses `ytdl-core` for downloading, `fluent-ffmpeg` for merging video/audio, and supports progress updates via Server-Sent Events (SSE).

---

## Front end

- The [front-end](../front-end/README.md) server running

## Middleware & Setup

- **CORS**: Allows requests from the frontend (default: `http://localhost:5173`).
- **JSON Parsing**: Parses incoming JSON requests.
- **Custom Middleware**: `verifyYoutube` checks if the provided link is a valid YouTube URL.

---

## Key Functions

- **sendProgress(message)**: Sends progress updates to all connected SSE clients.
- **downloadAndSave(link, filePath, ytdlOptions, onProgress)**: Downloads a YouTube stream (audio/video) and saves it to disk, reporting progress.
- **downloadVideoWithAudio(videoURL, outputFile)**: Downloads video and audio separately, merges them using FFmpeg, and cleans up temporary files.

---

## Endpoints

### `POST /convert`
- **Description**: Converts a YouTube link to either video (mp4) or audio (mp3).
- **Body**: `{ link: string, title: string }`
- **Query**: `type=video|audio`
- **Process**:
  - Validates input.
  - Downloads and merges (if video) or downloads audio only.
  - Saves file to `/downloads`.
  - Responds with status and filename.

### `GET /progress`
- **Description**: SSE endpoint for real-time progress updates.
- **Process**:
  - Keeps connection open.
  - Sends progress messages during download/merge.

### `GET /downloadFile`
- **Description**: Sends the converted file to the client.
- **Query**: `title`, `type`
- **Process**:
  - Checks if file exists.
  - Sends file as a download.
  - Deletes the `/downloads` folder after sending.


---

## Other Details

- **Temporary Files**: Video/audio are saved as temp files and deleted after merging.
- **Cleanup**: The `/downloads` folder is deleted after each download.
- **Port**: Defaults to `3000` unless overridden by `process.env.PORT`.

---

## Dependencies

- `express`, `cors`, `ytdl-core`, `fluent-ffmpeg`, `fs`, `path`

---

## Future features

- get lenght of video
- get name of video

## Example Usage

1. **Convert**:  
   `POST /convert?type=video` with JSON body `{ "link": "...", "title": "myfile" }`
2. **Download**:  
   `GET /downloadFile?title=myfile&type=video`
3. **Progress**:  
   Connect to `/progress` via EventSource for real-time updates.

---

**Note:**  
Clipboard and file system access may be restricted by browser or OS