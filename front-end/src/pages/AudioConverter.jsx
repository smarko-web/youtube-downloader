import { useOutletContext } from 'react-router-dom';
import { Form, AudioPrev } from '../components';

const AudioConverter = () => {
  const { videoId: audioId } = useOutletContext();
  return (
    <>
      <Form type={'audio'} />
      {audioId && (
        <section className="video-prev">
          <h1> no preview for audio convertions</h1>
        </section>
      )}
    </>
  );
};

export default AudioConverter;
