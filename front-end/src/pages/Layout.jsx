import {useState, useEffect, useRef} from 'react';
import {Outlet} from 'react-router-dom';
import {Header} from '../components';
import { ToastContainer, toast } from 'react-toastify';
const Layout = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
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

  const handleType = (e) => {
    if (e.target.value === '') {
      setVideoId('');
      setUrl('');
    }
    var regExp =
      /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (e.target.value.match(regExp)) {
      setVideoId(e.target.value.match(regExp)[1]);
      setUrl(e.target.value);
    } else {
      setUrl(e.target.value);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose="3000" />
      <Header />
      <main>
        <Outlet
          context={{
            url,
            setUrl,
            videoId,
            setVideoId,
            handleType,
            isConverting,
            setIsConverting,
          }}
        />
      </main>
    </>
  );
}

export default Layout;