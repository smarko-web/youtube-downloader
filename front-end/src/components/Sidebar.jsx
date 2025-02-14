const Sidebar = () => {
  return (
    <aside>
      <div className="logo">
        youtube <span>4</span> u
      </div>
      <div className="sidebar-buttom">
        <ul>
          <li>
            <a href="/">home</a>
          </li>
          <li>
            <a href="/">about</a>
          </li>
          <li>
            {isSubmenuOpen ? <FaChevronUp /> : <FaChevronDown />}
            <a onClick={toggleSubmenu}>type</a>
            {isSubmenuOpen && (
              <ul className="submenu">
                <li>
                  <a>mp3</a>
                </li>
                <li>
                  <a>mp4</a>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </aside>
  );
}
export default Sidebar;