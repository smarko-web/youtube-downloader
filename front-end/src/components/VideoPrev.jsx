import { useOutletContext } from "react-router-dom";
import ReactPlayer from 'react-player';
const VideoPrev = ({videoId}) => {
  return (
    <section className="video-prev">
      <ReactPlayer
        src={`https://www.youtube.com/watch?v=${videoId}`}
        controls={true}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </section>
  );
}
export default VideoPrev;