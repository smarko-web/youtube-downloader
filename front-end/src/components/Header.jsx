import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  FaBars,
  FaTimes,
  FaVideo,
  FaMusic,
} from 'react-icons/fa';

const useOutsideClick = (callback) => {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
}

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }
  const componentRef = useOutsideClick(() => {
    toggleSidebar();
  });

  const transition = {
    type: 'tween',
    duration: .5,
    ease: "easeOut",
    easeInOut: [0, 0.71, 0.2, 1.01],
    easeOut: [0, 0.71, 0.2, 1.01],
  };
  return (
    <header>
      <div className="container">
        <div className="logo">
          youtube <span>4</span> u
        </div>
        {isSidebarOpen ? (
          <FaTimes onClick={toggleSidebar} />
        ) : (
          <FaBars onClick={toggleSidebar} />
        )}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.nav
              ref={componentRef}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 120 }}
              exit={{ opacity: 0, y: 0 }}
              transition={transition}
            >
              <h1>convert to</h1>
              <ul>
                <li>
                  <FaMusic />
                  <NavLink to={'/audio'} onClick={toggleSidebar}>mp3</NavLink>
                </li>
                <li>
                  <FaVideo />
                  <NavLink to={'/video'} onClick={toggleSidebar}>mp4</NavLink>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
export default Header