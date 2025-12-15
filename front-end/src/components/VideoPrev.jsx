import ReactPlayer from 'react-player';
import { useEffect, useRef } from "react";
import { useOutletContext } from 'react-router-dom';
import { IoArrowBackSharp } from 'react-icons/io5';

const VideoPrev = ({ videoId, onClose }) => {
  const { searchResults, setIsVideoPrevShow, setIsVideoSearchShow } = useOutletContext();
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose && onClose();
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose && onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center">
      {/* semi-transparent backdrop with subtle blur */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        aria-hidden="true"
        onMouseDown={() => onClose && onClose()}
      />

      {/* centered popup */}
      <div
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        className="relative w-[92%] max-w-[900px] bg-white/95 dark:bg-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 mx-4"
      >
        {/* back button */}
        {searchResults && searchResults.length > 0 && (
          <button
            onClick={() => {
              setIsVideoPrevShow(false);
              setIsVideoSearchShow(true);
            }}
            aria-label="return to search"
            className="absolute top-3 left-3 z-20 inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/90 dark:bg-slate-700 text-gray-700 dark:text-gray-100 shadow hover:scale-105 transition-transform"
          >
            <IoArrowBackSharp />
          </button>
        )}
        {/* close button */}
        <button
          onClick={() => onClose && onClose()}
          aria-label="Close preview"
          className="absolute top-3 right-3 z-20 inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/90 dark:bg-slate-700 text-gray-700 dark:text-gray-100 shadow hover:scale-105 transition-transform"
        >
          ✕
        </button>

        {/* optional title / info area */}
        <div className="mb-3 text-sm text-gray-700 dark:text-gray-300 text-center">
          Video preview
        </div>

        {/* video wrapper keeps consistent padding and centers the player */}
        <div className="relative rounded-xl overflow-hidden bg-black pt-[56.25%]">
          <ReactPlayer
            src={`https://www.youtube.com/watch?v=${videoId}`}
            controls={true}
            width="100%"
            height="100%"
            className="absolute top-0 left-0"
          />
        </div>
      </div>
    </section>
  );
};
export default VideoPrev;