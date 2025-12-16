import { useOutletContext } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { FaSearch, FaPlay } from 'react-icons/fa';
import axios from "axios";

const SkeletonVideoCard = () => (
  <article className="flex items-center gap-3 p-3 border rounded-lg bg-white/95 dark:bg-slate-800 animate-pulse">
    <div className="w-36 h-20 flex-shrink-0 rounded-md bg-gray-500 dark:bg-slate-700" />
    <div className="flex-1 min-w-0 flex flex-col justify-between">
      <div>
        <div className="h-4 bg-gray-500 dark:bg-slate-700 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-500 dark:bg-slate-700 rounded w-1/3" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="h-3 bg-gray-500 dark:bg-slate-700 rounded w-12" />
        <div />
        <div className="h-6 w-14 bg-gray-500 dark:bg-slate-700 rounded" />
      </div>
    </div>
  </article>
);

const VideoCard = ({ video }) => {
  const {thumbnailUrl, title, wasLive, views, publishedAt, length, videoUrl, videoId} = video;
  const {
    setVideoId,
    setUrl,
    setVideoTitle,
    setVideoLength,
    setVideoChapters,
    getVideoInfo,
    setMainActionType, 
    setIsVideoPrevShow,
    setIsVideoSearchShow,
  } = useOutletContext();

  const formattedViews = views
    ? Number(views) >= 1000
      ? `${Math.round(Number(views) / 1000)}K views`
      : `${views} views`
    : '';

  return (
    <article
      className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer bg-white/95 dark:bg-slate-800"
      aria-label={title}
      title={title}
    >
      <div className="w-36 h-20 block relative flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full border-4 border-gray-200 bg-white/80 text-gray-700 pointer-events-none">
          <FaPlay className="pointer-events-none" />
        </div>
        <img
          src={thumbnailUrl}
          alt={title}
          onClick={async () => {
            setVideoId(videoId);
            setIsVideoSearchShow(false);
            setIsVideoPrevShow(true);
            setUrl(videoUrl);
            setMainActionType('prev');

            const { title, lengthSeconds, chapters } = await getVideoInfo(
              videoUrl
            );

            setVideoTitle(title);
            setVideoLength(lengthSeconds);
            setVideoChapters(chapters);
          }}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <a
            href={videoUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black text-sm font-medium"
          >
            {title}
          </a>

          <div className="text-xs text-gray-500 truncate mt-1">
            {publishedAt ? publishedAt : ''}
            {formattedViews ? ` • ${formattedViews}` : ''}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          {length ? (
            <div className="text-xs text-gray-900">{length}</div>
          ) : (
            <div className="text-xs text-red-600 font-medium">
              LIVE
            </div>
          )}
          <div />

          {wasLive ? (
            <span className="text-xs text-red-600 font-medium">
              REC <br /> LIVE
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
};

const SearchPrev = ({ onClose }) => {
  const {searchTerm, setSearchTerm, searchResults, setSearchResults} = useOutletContext();
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchInput, setSearchInput] = useState(searchTerm || '');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const itemRefs = useRef([]);
  const debounceRef = useRef(null);

  const popupRef = useRef(null);
  const inputRef = useRef(null);

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
 
  const fetchSuggestions = async (q) => {
    if (!q || q.trim() === '') {
      setSearchSuggestions([]);
      setSuggestionsVisible(false);
      return;
    }
    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/searchSuggestions`,
        {
          searchTerm: q,
        }
      );
      const { msg, suggestions } = data;
      if (msg && msg.includes('Search suggestions fetched successfully') && Array.isArray(suggestions)) {
        setSearchSuggestions(suggestions);
        setHighlightedIndex(-1);
        setSuggestionsVisible(true);
      } else {
        setSearchSuggestions([]);
        setSuggestionsVisible(false);
      }
    } catch (error) {
      console.error(`server error: ${error}`);
      setSearchSuggestions([]);
      setSuggestionsVisible(false);
    }
  };

  const handleSearchType = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 200);
  };

  // keyboard navigation for suggestions
  const handleInputKeyDown = (e) => {
    if (!suggestionsVisible || searchSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => {
        const next = Math.min(searchSuggestions.length - 1, i + 1);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(-1, i - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(searchSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setSuggestionsVisible(false);
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedIndex, searchSuggestions]);

  const selectSuggestion = (text) => {
    setSearchInput(text);
    setSearchTerm(text);
    setSearchSuggestions([]);
    setSuggestionsVisible(false);
    setHighlightedIndex(-1);
    // focus input so user can press Enter to search
    inputRef.current && inputRef.current.focus();
  };
  
  const handleSearchSubmit = async(e) => {
    e.preventDefault();
    
    const searchTermInput = searchInput || '';
    setIsSearching(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_SERVER_URL || "http://localhost:3000"}/search`, {
        searchTerm: searchTermInput,
      });
      const { msg, searchResults } = data;
      if (msg && msg.includes('Video search successfully')) {
        setSearchTerm(searchTermInput);
        const unique = (searchResults || []).filter(
          (v, i, arr) =>
            arr.findIndex(
              (t) =>
                (t.videoId && v.videoId && t.videoId === v.videoId) ||
                (t.videoUrl && v.videoUrl && t.videoUrl === v.videoUrl) ||
                (t.title && v.title && t.title === v.title)
            ) === i
        );
        setSearchResults(unique);

        // close suggestions on submit
        setSearchSuggestions([]);
        setSuggestionsVisible(false);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

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
          Video search
        </div>
        <div className="mt-7">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-full mx-auto"
          >
            <div className="relative overflow-visible">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <FaSearch />
              </span>

              <input
                ref={inputRef}
                name="search"
                type="search"
                value={searchInput}
                onChange={handleSearchType}
                onKeyDown={handleInputKeyDown}
                placeholder="Search for videos"
                aria-label="Search videos"
                aria-autocomplete="list"
                aria-controls="suggestions-list"
                aria-expanded={suggestionsVisible}
                aria-activedescendant={
                  highlightedIndex >= 0
                    ? `suggestion-${highlightedIndex}`
                    : undefined
                }
                className="w-full pl-10 pr-28 py-2.5 rounded-lg border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition"
              />

              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Search
              </button>

             {suggestionsVisible && searchSuggestions && searchSuggestions.length > 0 && (
               <ul
                 id="suggestions-list"
                 role="listbox"
                 aria-label="Search suggestions"
                 className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-auto z-50 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg"
               >
                 {searchSuggestions.map((suggestion, idx) => {
                   return (
                     <li
                       key={idx}
                       id={`suggestion-${idx}`}
                       role="option"
                       aria-selected={highlightedIndex === idx}
                       ref={(el) => (itemRefs.current[idx] = el)}
                       onMouseDown={(ev) => ev.preventDefault()}
                       onClick={() => selectSuggestion(suggestion)}
                       className={`cursor-pointer px-3 py-2 text-sm truncate ${
                         highlightedIndex === idx
                           ? 'bg-indigo-600 text-white'
                           : 'text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-600'
                       }`}
                     >
                       {suggestion}
                     </li>
                   );
                 })}
               </ul>
             )}
            </div>
          </form>
        

          {/* results area */}
          <div className="max-h-[60vh] overflow-auto mt-5 relative z-10">          
            {isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({length : 6}).map((_, idx) => {
                  return <SkeletonVideoCard key={idx}/>
                })}
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.map((video) => (
                  <VideoCard key={video.videoId} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 py-6">
                No results yet. Enter a search term and press Enter.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
export default SearchPrev;