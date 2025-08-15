import { useOutletContext } from "react-router-dom";
import { Form, VideoPrev } from "../components";

const VideoConverter = () => {
  const {videoId} = useOutletContext();
  return (
    <>
      <Form type={"video"}/>
      {videoId && <VideoPrev videoId={videoId}/>}  
    </>
  )
};

export default VideoConverter;