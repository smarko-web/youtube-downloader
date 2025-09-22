import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { toast } from 'react-toastify';
import ReactSlider from 'react-slider';
import ToggleSwitch from "./ToggleSwitch";


const Form = ({type}) => {
  const {
    url,
    setUrl,
    handleType,
    videoId,
    getVideoInfo,
    videoTitle,
    setVideoTitle,
    videoLength,
    setVideoLength,
    videoChapters,
    setVideoChapters,
    setVideoId,
    isConverting,
    setIsConverting,
    setProgress,
    isVideoClipped,
    setIsVideoClipped,
    videoClipTimestamps,
    setVideoClipTimestamps,
  } = useOutletContext();

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleVideoClipStartTimeChange = (e) => {
    setVideoClipTimestamps((prev) => {
      return {...prev, startTime: e.target.value};
    });
  };
  const handleVideoClipEndTimeChange = (e) => {
    setVideoClipTimestamps((prev) => {
      return {...prev, endTime: e.target.value};
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsConverting(true);
  const formData = new FormData(e.target);
  const inputUrl = formData.get('url');
  const inputTitle = formData.get('title') || type;

  try {
    const response = await axios.post(
      `${
        import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
      }/convert?type=${type}`,
      {
        link: inputUrl,
        title: inputTitle,
      }
    );

    const { msg } = response.data;

    if (msg.includes('Downloaded')) {
        setUrl(''); 
        setVideoId(''); 
        setVideoTitle('');
        setVideoLength(null);
        setVideoChapters({});
        setIsVideoClipped(false);
        setIsConverting(false);
        setVideoClipTimestamps({ startTime: 0, endTime: videoLength });
        setProgress(null);
        await downloadToClient(inputTitle, type === 'video' ? 'mp4' : 'mp3');
        formData.delete('url');
        formData.delete('title');
        toast.success(msg);
    } else {
        toast.error(msg);
    }
  } catch (error) {
    console.error('Error during conversion:', error);
    toast.error('Conversion failed. Check server logs.');
  } finally {
    setIsConverting(false);
  }
  };
  const downloadToClient = async (fileName, fileExtension) => {
    try {
      const response = await axios.get(`${
        import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
      }/downloadFile`, {
        params: {
          title: fileName,
          type,
        },
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Download failed.');
    }
  }
  const autoPaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (new URL(clipboardText) && url === '') {
        var regExp =
        /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        
        if (clipboardText.match(regExp)) {
          toast.success('youtube link recognized');
          setUrl(clipboardText);
          const { title, lengthSeconds, chapters } = await getVideoInfo(
            clipboardText
          );
          setVideoTitle(title);
          setVideoLength(lengthSeconds);
          setVideoChapters(chapters);
          setVideoId(clipboardText.match(regExp)[1]);
        } else {
          setUrl('');
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <section className="container">
      <h1>{type} converter</h1>
      <form action="" method="post" onSubmit={handleSubmit}>
        <input
          type="text"
          name="url"
          onClick={autoPaste}
          onTouchStart={autoPaste}
          onChange={(e) => handleType(e)}
          placeholder="Paste YouTube link"
          value={url || ''}
        />
        {videoId && (
          <input
            type="text"
            name="title"
            placeholder={`name ${type} file (eg. ${
              videoTitle.split(' ').length > 5
                ? videoTitle.split(' ').slice(0, 5).join(' ') + '...'
                : videoTitle
            })`}
          />
        )}
        {videoId && (
          <div className="switch-container">
            <ToggleSwitch
              checked={isVideoClipped}
              handleChange={() => setIsVideoClipped(!isVideoClipped)}
            />
          </div>
        )}
        {isVideoClipped && (
          <div className="slider-container">
            <div className="time-container">
              <div className="video-clip-start">
                {formatTime(videoClipTimestamps.startTime)}
              </div>
              <div className="video-clip-end">
                {formatTime(videoClipTimestamps.endTime || videoLength)}
              </div>
            </div>
            {/* video chapters */}
            {/* <div>
              {videoChapters &&videoChapters.map(({ title, start_time }) => {
                return <p key={start_time}>{`${title} : ${formatTime(start_time)}`}</p>;
              })}
            </div> */}
            {/* video chapters */}
            <ReactSlider
              className="time-slider"
              thumbClassName="time-thumb"
              trackClassName="time-track"
              value={[
                videoClipTimestamps.startTime,
                Number(videoClipTimestamps.endTime || videoLength),
              ]}
              onChange={([start, end]) => {
                setVideoClipTimestamps({ startTime: start, endTime: end });
              }}
              ariaLabel={['Start time', 'End time']}
              min={0}
              max={Number(videoLength)}
              step={1}
              minDistance={5}
            />
          </div>
        )}
        <button type="submit" disabled={isConverting}>
          {isConverting ? `Converting ${type}...` : `Convert ${type}`}
        </button>
      </form>
    </section>
  );
}
export default Form;