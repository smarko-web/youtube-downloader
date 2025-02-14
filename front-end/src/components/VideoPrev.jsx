import { useOutletContext } from "react-router-dom";

const VideoPrev = ({videoId}) => {
  // https://www.youtube.com/watch?v=draPIiNIIfI
 
  return (
    <section className="video-prev">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
      ></iframe>
    </section>
  );
}
export default VideoPrev;