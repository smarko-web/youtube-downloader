import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from 'react-toastify';
import ReactSlider from 'react-slider';
import ToggleSwitch from "./ToggleSwitch";

const Form = ({type}) => {
  const [visibleTooltip, setVisibleTooltip] = useState(null); // { index: number } or null
  const tooltipTimerRef = useRef(null);
  const TOOLTIP_MS = 4000;
  const CHAP_TOLERANCE = 0.6; // seconds tolerance to consider thumb "on" chapter
  const {
    url,
    setUrl,
    handleType,
    videoId,
    getVideoInfo,
    setMainActionType,
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

  useEffect(() => {
    // when either thumb moves, check if it's on a chapter start and show tooltip for a few seconds
    const checkThumb = (value) => {
      if (
        !Array.isArray(videoChapters) ||
        !videoChapters ||
        videoChapters.length === 0
      )
        return null;
      const v = Number(value ?? 0);
      return videoChapters.findIndex((ch) => {
        const chStart = Number(ch.start_time) || 0;
        return Math.abs(chStart - v) <= CHAP_TOLERANCE;
      });
    };

    const startMatch = checkThumb(videoClipTimestamps.startTime);
    const endMatch = checkThumb(videoClipTimestamps.endTime);
    const matchIndex =
      startMatch !== -1 ? startMatch : endMatch !== -1 ? endMatch : -1;

    if (matchIndex !== -1) {
      // show tooltip for this chapter
      setVisibleTooltip(matchIndex);
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = setTimeout(() => {
        setVisibleTooltip(null);
      }, TOOLTIP_MS);
    }

    return () => {
      // don't clear the tooltip timer on every thumb change, only on unmount
    };
  }, [
    videoClipTimestamps.startTime,
    videoClipTimestamps.endTime,
    videoChapters,
  ]);

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
          setMainActionType('search');
          setVideoLength(null);
          setVideoChapters({});
          setIsVideoClipped(false);
          setIsConverting(false);
          setVideoClipTimestamps({ startTime: 0, endTime: videoLength });
          setProgress(null);
          await downloadToClient(inputTitle, type === 'video' ? 'mp4' : 'mp3');
          formData.delete('url');
          formData.delete('title');
          // toast.success(msg);
          // temp place holder
          toast.warning('this is currently under development, please contribute to this project');
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
          setMainActionType('prev');
          setVideoTitle(title);
          setVideoLength(lengthSeconds);
          setVideoChapters(chapters);
          setVideoId(clipboardText.match(regExp)[1]);
        } else {
          setMainActionType('search');
          setUrl('');
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <section className="w-[90vw] min-w-[275px] max-w-[875px] mt-8 flex flex-col items-center gap-4 h-fit absolute top-[70px] left-[50%] translate-x-[-50%]">
      <h1 className="text-2xl">{type} converter</h1>
      <form
        action=""
        method="post"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full"
      >
        <input
          type="text"
          name="url"
          onClick={autoPaste}
          onTouchStart={autoPaste}
          onChange={(e) => handleType(e)}
          placeholder="Paste YouTube link"
          value={url || ''}
          className="bg-white rounded-xl p-3"
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
            className="bg-white rounded-xl p-3"
          />
        )}
        {videoId && (
          <div className="flex justify-center content-center mt-0">
            <ToggleSwitch
              type={type}
              checked={isVideoClipped}
              handleChange={() => setIsVideoClipped(!isVideoClipped)}
            />
          </div>
        )}
        {isVideoClipped && (
          <div className="flex flex-col relative mb-8 w-full top-[1px]">
            <div className="text-[1.2em] flex justify-between">
              <div>{formatTime(videoClipTimestamps.startTime)}</div>
              <div>
                {formatTime(videoClipTimestamps.endTime || videoLength)}
              </div>
            </div>

            <ReactSlider
              className="w-full h-[25px] mt-[1px] "
              thumbClassName="h-[20px] w-[20px] bg-white rounded-[50%] cursor-pointer relative top-[50%] z-30"
              trackClassName="top-[50%] translate-y-[-50%] h-[4px] bg-[#ddd]"
              renderTrack={(props, { index }) => {
                // state.index = 0 (left), 1 (middle/red), 2 (right)
                const base = 'top-5  h-2 absolute';
                const color =
                  index === 1
                    ? 'bg-red-500' // Between the thumbs
                    : 'bg-gray-300'; // Outside thumbs
                return (
                  <div {...props} key={index} className={`${base} ${color}`} />
                );
              }}
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

            {videoChapters &&
              Array.isArray(videoChapters) &&
              videoChapters.length > 0 &&
              Number(videoLength) > 0 && (
                <div className="relative left-0 right-0 top-[50%] -translate-y-1/2 h-[4px] pointer-events-none">
                  {videoChapters.map((ch, idx) => {
                    const start = Number(ch.start_time) || 0;
                    const percent = Math.min(
                      100,
                      Math.max(0, (start / Number(videoLength)) * 100)
                    );
                    return (
                      <div
                        key={idx}
                        className="absolute  top-1/2 -translate-y-1/2"
                        style={{ left: `${percent}%` }}
                      >
                        <button
                          type="button"
                          // allow clicking marker to jump start thumb there
                          onClick={(e) => {
                            e.stopPropagation();
                            setVideoClipTimestamps((prev) => ({
                              ...prev,
                              startTime: start,
                            }));
                          }}
                          title={
                            ch.title
                              ? `${ch.title} — ${formatTime(start)}`
                              : `Chapter ${idx + 1} — ${formatTime(start)}`
                          }
                          aria-label={ch.title ?? `Chapter ${idx + 1}`}
                          // enable pointer events for the marker itself
                          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.75 h-1.75 !bg-black rounded-full shadow pointer-events-auto z-10"
                          style={{ left: `${percent}%` }}
                        />


                        {/* transient tooltip shown when a thumb is on this chapter */}
                        {visibleTooltip === idx && (
                          <div className="absolute top-full mt-2 -translate-x-1/2 pointer-events-none z-40">
                            <div className="relative inline-block">
                              <div className="bg-black text-white text-xs px-2 py-1 rounded-md shadow-md text-left max-w-xs">
                                <div className="font-medium truncate">
                                  {ch.title || `Chapter ${idx + 1}`}
                                </div>
                                <div className="text-[11px] opacity-80">
                                  {formatTime(start)}
                                </div>
                              </div>
                              {/* small caret */}
                              <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-black rotate-45" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}
        <button
          type="submit"
          disabled={isConverting}
          className="p-4 rounded-xl"
        >
          {isConverting ? `Converting ${type}...` : `Convert ${type}`}
        </button>
      </form>
    </section>
  );
};
export default Form;