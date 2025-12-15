import {useState, useEffect, useRef} from 'react';
import {Outlet} from 'react-router-dom';
import {Header} from '../components';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
const Layout = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoLength, setVideoLength] = useState(null);
  const [videoChapters, setVideoChapters] = useState([]);
  const [isVideoClipped, setIsVideoClipped] = useState(false);
  const [mainActionType, setMainActionType] = useState('search');
  const [isVideoPrevShow, setIsVideoPrevShow] = useState(false);
  const [isVideoSearchShow, setIsVideoSearchShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [videoClipTimestamps, setVideoClipTimestamps] = useState({startTime: 0, endTime: videoLength});
  const [progress, setProgress] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  const toastId = useRef(null);
  useEffect(() => {
    if (!isConverting) return;

    const eventSource = new EventSource(
      `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/progress`
    );

    eventSource.onmessage = (event) => {
      const { message } = JSON.parse(event.data);
      setProgress(message);

      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.info(message, { toastId: 'progress-toast' });
      } else {
        toast.update('progress-toast', { render: message });
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      eventSource.close();
    };

    return () => {
      setProgress(null);
      eventSource.close();
    };
  }, [isConverting]);

  const getVideoInfo = async (url) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/getInfo`,
        {
          link: url,
        }
      );
      const { msg, info } = response.data;
      msg !== 'Video info fetched successfully' &&
        toast.error('could not fetch video info');
      const { title, lengthSeconds, chapters } = info;
      return { title, lengthSeconds, chapters };
    } catch (error) {
      console.error('Error fetching video info:', error);
      toast.error('Failed to fetch video info.');
    }
  };

  const handleType = async(e) => {
    if (e.target.value === '') {
      setVideoId('');
      setUrl('');
      setMainActionType('search');
      setVideoTitle('');
      setVideoLength(null);
      setVideoChapters({});
      setIsVideoClipped(false);
      setIsConverting(false);
      setVideoClipTimestamps({ startTime: 0, endTime: videoLength });
      setProgress(null);
    }
    var regExp =
      /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (e.target.value.match(regExp)) {
      setVideoId(e.target.value.match(regExp)[1]);
      setUrl(e.target.value);
      setMainActionType('prev');
      const { title, lengthSeconds, chapters } = await getVideoInfo(
        e.target.value
      );
      setVideoTitle(title);
      setVideoLength(lengthSeconds);
      setVideoChapters(chapters);
    } else {
      setUrl(e.target.value);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose='3000'/>
      <Header />
      <main className="w-full flex flex-col items-center px-4">
        <Outlet
          context={{
            url,
            setUrl,
            videoId,
            getVideoInfo,
            videoTitle,
            setVideoTitle,
            videoLength,
            setVideoLength,
            videoChapters,
            setVideoChapters,
            isVideoClipped,
            setIsVideoClipped,
            mainActionType,
            setMainActionType,
            isVideoPrevShow,
            setIsVideoPrevShow,
            isVideoSearchShow,
            setIsVideoSearchShow,
            searchTerm,
            setSearchTerm,
            searchResults,
            setSearchResults,
            videoClipTimestamps,
            setVideoClipTimestamps,
            setVideoId,
            handleType,
            isConverting,
            setIsConverting,
            setProgress,
          }}
        />
      </main>
    </>
  );
}

export default Layout;