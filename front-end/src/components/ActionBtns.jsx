import VideoPrev from './VideoPrev';
import SearchPrev from './SearchPrev';
import { useOutletContext } from 'react-router-dom';
import { FaEye, FaSearch } from 'react-icons/fa';
import { motion } from 'motion/react';

const ActionBtns = () => {
  const {
    mainActionType,
    videoId,
    isVideoPrevShow,
    setIsVideoPrevShow,
    isVideoSearchShow,
    setIsVideoSearchShow,
  } = useOutletContext();

  const btnVariants = {
    hidden: { x: 200, rotate: 90, opacity: 0 },
    visible: { x: 0, rotate: 0, opacity: 1 },
    exit: { x: 200, rotate: 90, opacity: 0 },
  };

  const sharedTransition = {
    x: { type: 'spring', stiffness: 160, damping: 20 },
    rotate: { duration: 0.6, ease: 'easeInOut' },
    opacity: { duration: 0.25 },
  };

  return (
    <>
      <div className="fixed bottom-4 left-[50%] translate-x-[-50%] flex justify-end items-center w-[90vw] min-w-[275px] max-w-[875px]">
        {mainActionType === 'search' ? (
          !isVideoSearchShow && (
            <motion.button
              className=" p-4 bg-red-700 text-white rounded-full text-2xl h-14 w-14 flex justify-center items-center origin-center"
              onClick={() => {
                setIsVideoSearchShow((prev) => !prev);
              }}
              aria-pressed={isVideoSearchShow}
              title={'Toggle Search'}
              variants={btnVariants}
              initial="hidden"
              animate={isVideoSearchShow ? 'exit' : 'visible'}
              transition={sharedTransition}
              whileHover={{
                scale: 1.06,
                rotate: isVideoSearchShow ? 90 : 8,
              }}
              whileTap={{ scale: 0.96 }}
            >
              {<FaSearch />}
            </motion.button>
          )
        ) : (
          <motion.button
            className=" p-4 bg-red-700 text-white rounded-full text-2xl h-14 w-14 flex justify-center items-center origin-center"
            onClick={() => {
              setIsVideoPrevShow((prev) => !prev);
            }}
            aria-pressed={isVideoPrevShow}
            title="Toggle preview"
            variants={btnVariants}
            initial="hidden"
            animate={isVideoPrevShow ? 'exit' : 'visible'}
            transition={sharedTransition}
            whileHover={{ scale: 1.06, rotate: isVideoPrevShow ? 90 : 8 }}
            whileTap={{ scale: 0.96 }}
          >
            <FaEye />
          </motion.button>
        )}
      </div>
      {isVideoPrevShow && (
        <VideoPrev
          videoId={videoId}
          onClose={() => setIsVideoPrevShow(false)}
        />
      )}
      {isVideoSearchShow && (
        <SearchPrev onClose={() => setIsVideoSearchShow(false)} />
      )}
    </>
  );
};
export default ActionBtns;