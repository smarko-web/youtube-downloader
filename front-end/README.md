# YouTube Downloader React App

This is the React front-end for a YouTube downloader application. It allows users to convert YouTube videos to MP3 (audio) or MP4 (video) formats and download them.

## Features

- automatically paste Youtube links from clipboard (if browser allows this functionality)
- Convert YouTube videos to MP3 or MP4
- Download converted files directly from the browser
- Progress notifications during conversion and download
- Responsive UI with navigation and sidebar

## Project Structure

```
front-end/
  public/
    vite.svg
  src/
    App.jsx           # Main app entry, sets up routing
    main.jsx          # React root rendering
    App.css           # App-specific styles
    index.css         # Global styles
    components/
      Header.jsx      # Top navigation/header
      Sidebar.jsx     # Sidebar navigation (not used, see Header)
      Form.jsx        # Input form for YouTube links
      VideoPrev.jsx   # Video preview component
      AudioPrev.jsx   # Audio preview component (future feature, needs development)
      index.js        # Components barrel export
    pages/
      Layout.jsx          # Layout with context and progress handling
      Home.jsx            # Home page with conversion options
      VideoConverter.jsx  # Video conversion page
      AudioConverter.jsx  # Audio conversion page
      index.js            # Pages barrel export
  index.html
  package.json
  vite.config.js
  eslint.config.js
  .env
  .gitignore
  README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- The [back-end](../back-end/README.md) server running

### Installation

1. Install dependencies:
   ```sh
   npm install
   ```

2. Set the backend URL in `.env` if needed:
   ```
   VITE_SERVER_URL=http://localhost:3000
   ```

### Running the App

Start the development server:
```sh
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173).

## Usage

1. Paste a YouTube link into the input field.
2. Choose to convert to video (mp4) or audio (mp3).
3. Download the converted file when ready.

## Environment Variables

- `VITE_SERVER_URL`: URL of the backend server (default: `http://localhost:3000`).

## License

MIT

---

This project uses [Vite](https://vitejs.dev/) and [React](https://react.dev/).