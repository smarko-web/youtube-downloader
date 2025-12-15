# YouTube Downloader Backend

This Express.js server provides endpoints to convert and download YouTube videos or audio files. It uses `ytdl-core` for downloading, `fluent-ffmpeg` for merging video/audio, and supports real-time progress updates via Server-Sent Events (SSE).

---

## Front end

- The [front-end](../front-end/README.md) server runs separately and should be allowed by CORS (default origin: `http://localhost:5173`).

## Middleware & Setup

- **CORS**: Allows requests from the frontend (default: `http://localhost:5173`). Override with the `FRONT_END_URL` environment variable.
- **JSON Parsing**: Parses incoming JSON requests.
- **Custom Middleware**: `verifyYoutube` validates that the provided link is a YouTube URL before most endpoints run.

---

## Key utilities & behavior

- **sendProgress(message)**: Broadcasts progress messages to all connected SSE clients.
- **downloadAndSave(link, filePath, ytdlOptions, onProgress)**: Downloads a YouTube stream (audio/video) and saves it to disk; reports progress via the provided callback.
- **downloadVideoWithAudio(videoURL, outputFile)**: Downloads the highest video-only and highest audio-only streams to temporary files, then merges them using FFmpeg into `outputFile`. Temporary files are removed after merging.
- Temporary files used when merging:
  - `temp_video.mp4`
  - `temp_audio.mp4`
- The server creates a `./downloads` folder (recursive) when converting and cleans it up after the client downloads the file.

---

## Endpoints

### POST /convert

- Description: Converts a YouTube link to either video (mp4) or audio (mp3).
- Query: `type=video|audio` (required)
- Body: `{ link: string, title: string }` (title is required; used as filename)
- Process:
  - Validates the YouTube URL via `verifyYoutube`.
  - Creates `./downloads` if needed.
  - For `type=video`: calls `downloadVideoWithAudio` (download video + audio, merge with FFmpeg).
  - For `type=audio`: downloads audio only with `downloadAndSave` and saves as `.mp3`.
  - Responds with `{ msg, fileName }` on success.
- Notes:
  - Filenames are derived from the provided `title`. Sanitize client-side to avoid filesystem issues.
  - If multiple concurrent conversions run, cleanup logic (removing entire `./downloads`) may interfere — avoid concurrent downloads in production or change cleanup behavior.

### GET /progress

- Description: SSE endpoint. Clients connect with:
  - `const es = new EventSource('/progress')`
- Behavior:
  - Response headers are set for SSE (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`).
  - The server pushes JSON messages as `data: {"message":"..."}\n\n` via `sendProgress`.
  - Connected clients are tracked and removed on connection close.

### GET /downloadFile

- Description: Serves the converted file from `./downloads`.
- Query: `title`, `type` (`video` or `audio`)
- Process:
  - Validates presence of file.
  - Uses `res.download` to send the file.
  - After a successful send, removes `./downloads` directory (`fs.rm(..., { recursive: true, force: true })`) to clean up.

### POST /getInfo

- Description: Fetches basic video info via `ytdl.getBasicInfo`.
- Body: `{ link: string }`
- Returns: `{ title, lengthSeconds, chapters }` inside `info`.

### POST /search

- Description: Searches YouTube without an API key using `youtube-search-without-api-key`.
- Body: `{ searchTerm: string }`
- Behavior:
  - Returns an array of formatted search results: `{ videoId, videoUrl, title, length, publishedAt, views, thumbnailUrl, wasLive }`.
  - Input validation: returns a friendly message when `searchTerm` is empty.

### POST /searchSuggestions

- Description: Returns YouTube search suggestions using Google's suggestqueries endpoint.
- Body: `{ searchTerm: string }`
- Behavior:
  - Calls `http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=...`.
  - Returns the suggestions array from the response.

---

## Usage / Example flow

1. Connect to progress SSE:
   - `const es = new EventSource('http://localhost:3000/progress');`
2. Start conversion:
   - `POST http://localhost:3000/convert?type=video`
   - Body: `{ "link": "https://youtube.com/...", "title": "myfile" }`
3. Receive progress messages via SSE while downloading and ffmpeg merges.
4. After conversion completes, call:
   - `GET http://localhost:3000/downloadFile?title=myfile&type=video`
5. Server will remove `./downloads` after the file is sent.

---

## Environment & configuration

- PORT — server port (default: `3000`)
- FRONT_END_URL — allowed frontend URL for CORS (default: `http://localhost:5173`)
- Ensure `ffmpeg` is installed and available in PATH (required by `fluent-ffmpeg`).

---

## Install

```sh
cd back-end
npm install
```

## Start

```sh
npm start
```

(or `node index.js` / run via a process manager)

---

## Dependencies

- express (^4.21.2)
- cors (^2.8.5)
- axios (^1.13.2)
- ytdl-core (^4.11.5)
  - (view issue)[https://github.com/fent/node-ytdl-core/issues/1326]
- youtube-search-without-api-key (^2.0.7)
- fluent-ffmpeg (^2.1.3)
- fs, path (Node built-ins)

---

## Notes & Caveats

- Filenames are taken directly from the provided `title`. Sanitize user input to avoid path traversal or invalid filenames.
- The server deletes the whole `./downloads` folder after a file is sent; adjust this behavior if you need concurrency or persistence.
- Large downloads and long-running ffmpeg operations may require process supervision or different timeout strategies in production.
- If ffmpeg isn't found, merging video+audio will fail — install ffmpeg (`brew install ffmpeg` on macOS).
- Example clip/trimming utility exists in `videoClip.js` for future feature.
- Use `videoDetails.json` for mock data during front-end development.
