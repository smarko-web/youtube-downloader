import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { toast } from 'react-toastify';
 
const Form = ({type}) => {
  const { url, setUrl, handleType, videoId, setVideoId, isConverting, setIsConverting } = useOutletContext();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsConverting(true);
   const formData = new FormData(e.target);
   const inputUrl = formData.get('url');
   const inputTitle = formData.get('title') || type;

   try {
     const response = await axios.post(
       `${
         import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
       }/convert?type=${type}`,
       {
         link: inputUrl,
         title: inputTitle,
       }
     );

     const { msg } = response.data;

     if (msg.includes('Downloaded')) {
        setUrl(''); 
        setVideoId(''); 
        await downloadToClient(inputTitle, type === 'video' ? 'mp4' : 'mp3');
        formData.delete('url');
        formData.delete('title');
        toast.success(msg);
     } else {
        toast.error(msg);
     }
   } catch (error) {
     console.error('Error during conversion:', error);
     toast.error('Conversion failed. Check server logs.');
   } finally {
     setIsConverting(false);
   }
  };
  const downloadToClient = async (fileName, fileExtension) => {
    try {
      const response = await axios.get(`${
         import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
       }/downloadFile`, {
        params: {
          title: fileName,
          type,
        },
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Download failed.');
    }
  }
  const autoPaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (new URL(clipboardText) && url === '') {
        var regExp =
        /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        
        if (clipboardText.match(regExp)) {
          toast.success('youtube link recognized');
          setUrl(clipboardText);
          setVideoId(clipboardText.match(regExp)[1]);
        } else {
          setUrl('');
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <section className="container">
      <h1>{type} converter</h1>
      <form action="" method="post" onSubmit={handleSubmit}>
        <input
          type="text"
          name="url"
          onClick={autoPaste}
          onTouchStart={autoPaste}
          onChange={(e) => handleType(e)}
          placeholder="Paste YouTube link"
          value={url || ''}
        />
        {videoId && (
          <input type="text" name="title" placeholder={`name ${type} file`} />
        )}
        <button type="submit" disabled={isConverting}>
          {isConverting ? `Converting ${type}...` : `Convert ${type}`}
        </button>
      </form>
    </section>
  );
}
export default Form;