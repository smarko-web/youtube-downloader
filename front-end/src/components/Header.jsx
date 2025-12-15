import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  FaBars,
  FaTimes,
  FaVideo,
  FaMusic,
} from 'react-icons/fa';


const useOutsideClick = (callback, active = true) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;

    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [callback, active]);

  return ref;
};


const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const componentRef = useOutsideClick(closeSidebar, isSidebarOpen);

  useEffect(() => {
    if (!isSidebarOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isSidebarOpen]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.45 },
    exit: { opacity: 0 },
  };

  const menuVariants = {
    hidden: { y: -12, opacity: 0, scale: 0.98 },
    visible: {
      y: 12,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 160,
        damping: 20,
        when: 'beforeChildren',
        staggerChildren: 0.04,
      },
    },
    exit: { y: -8, opacity: 0, scale: 0.99, transition: { duration: 0.18 } },
  };

  const itemVariants = {
    hidden: { y: -8, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.18 } },
    exit: { y: -6, opacity: 0, transition: { duration: 0.12 } },
  };
    return (
      <header className="absolute bg-white top-0 flex justify-center px-0.75 w-[100vw] h-20 z-20">
        <div className="relative flex justify-between items-center w-[90vw] min-w-[275px] max-w-[875px]">
          <Link
            to="/"
            className="bg-red-500 h-[3.25rem] w-[8rem] flex justify-center items-center rounded-xl no-underline shadow-md"
            aria-label="Home"
          >
            <div className="text-white font-semibold select-none">
              youtube <span className="font-bold">4</span> u
            </div>
          </Link>

          <button
            onClick={toggleSidebar}
            aria-expanded={isSidebarOpen}
            aria-controls="convert-nav"
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            className="p-2 rounded-md text-2xl text-gray-700 hover:bg-gray-100 transition"
            title="Toggle menu"
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          <AnimatePresence>
            {isSidebarOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  key="backdrop"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={backdropVariants}
                  onClick={closeSidebar}
                  className="fixed inset-0 bg-black/40 z-10"
                />

                {/* Menu */}
                <motion.nav
                  id="convert-nav"
                  key="menu"
                  className="absolute top-[70px] z-20 py-4 flex flex-col items-center bg-red-600 rounded-br-lg rounded-bl-lg shadow-lg w-[90vw] min-w-[275px] max-w-[875px]"
                  ref={componentRef}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={menuVariants}
                  role="dialog"
                  aria-modal="true"
                >
                  <motion.p
                    className="font-900 text-3xl text-white border-b-2 border-white w-full text-center pb-2"
                    variants={itemVariants}
                  >
                    convert to
                  </motion.p>

                  <motion.ul
                    className="h-28 flex flex-col justify-center gap-3 mt-6 list-none w-full px-6"
                    variants={{}}
                  >
                    <motion.li variants={itemVariants} className="w-full">
                      <NavLink
                        to="/audio"
                        onClick={closeSidebar}
                        className="flex items-center gap-3 text-white rounded-md px-3 py-2 hover:bg-white/10 transition"
                      >
                        <FaMusic className="min-w-[20px]" />
                        <span className="font-medium">mp3</span>
                      </NavLink>
                    </motion.li>

                    <motion.li variants={itemVariants} className="w-full">
                      <NavLink
                        to="/video"
                        onClick={closeSidebar}
                        className="flex items-center gap-3 text-white rounded-md px-3 py-2 hover:bg-white/10 transition"
                      >
                        <FaVideo className="min-w-[20px]" />
                        <span className="font-medium">mp4</span>
                      </NavLink>
                    </motion.li>
                  </motion.ul>
                </motion.nav>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>
    );
};
export default Header;