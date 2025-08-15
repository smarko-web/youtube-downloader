import ReactPlayer from 'react-player';
import { useEffect, useRef, useState } from 'react';

const AudioPrev = ({ audioId }) => {
  
  return (
    <section>
      <iframe src={`https://www.youtube.com/embed/${audioId}`} />
    </section>
  );
};  
export default AudioPrev;
