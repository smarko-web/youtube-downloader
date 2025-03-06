import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { toast } from 'react-toastify';
 

const Form = ({type}) => {
  const { url, setUrl, handleType, videoId, setVideoId } = useOutletContext();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputData = new FormData(e.target);
    const inputUrl = inputData.get('url');
    // const inputTitle = !inputUrl ? '' || type : `${type}`;
    const inputTitle = inputData.get('title') || type;
    const {
      data: { msg },
    } = await axios({
      method: 'post',
      url: `http://localhost:3000/convert?type=${type}`,
      data: {
        link: inputUrl,
        title: inputTitle,
      },
    });
    // msg.includes('downloaded') ? await axios.get('http://127.0.0.1:3000/downloadFile') : false;
    msg.includes('downloaded') && type === 'video' ? await downloadToClient(inputTitle, 'mp4') : false;
    msg.includes('downloaded') && type === 'audio' ? await downloadToClient(inputTitle, 'mp3') : false;
    !msg.includes('downloaded') ? toast.error(msg) : toast.success(msg);
  }
  const downloadToClient = async (fileName, fileExtension) => {
    try {
      const {data} = await axios.get('http://127.0.0.1:3000/downloadFile', {
        responseType: 'blob',
      });
      console.log(data);
      download(data, `${fileName}.${fileExtension}`);
    } catch (error) {
      return toast.error(error);
    }
    // const { data } = await axios.get('http://127.0.0.1:3000/downloadFile', {
    //   responseType: 'blob',
    // });
    // console.log(await data);
    // const response = await fetch('http://127.0.0.1:3000/downloadFile');
    // const resBlob = await response.blob();
    // console.log(await resBlob);
    // // create file link in browser's memory
    // const href = URL.createObjectURL(resBlob);

    // // create "a" HTML element with href to file & click
    // const link = document.createElement('a');
    // link.href = await href;
    // link.setAttribute('download', `${fileName}.${fileExtension}`); //or any other extension
    // document.body.appendChild(link);
    // link.click();

    // // clean up "a" element & remove ObjectURL
    // document.body.removeChild(link);
    // URL.revokeObjectURL(href);
    // console.log(data);
    // download(data, 'test.mp4');
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
            <input type="text" name="url" onClick={autoPaste} onChange={(e) => handleType(e)} placeholder="Paste YouTube link" value={url || ''}/>
            {videoId && <input type="text" name="title" placeholder={`name ${type} file`}/>}
            <button type="submit">
                convert {type}
            </button>
        </form>
    </section>
  )
}
export default Form;