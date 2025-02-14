import { useContext } from "react";
import MyContext from '../App';
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { toast } from 'react-toastify';
 

const Form = ({type}) => {
  const { url, setUrl, handleType, setVideoId } = useOutletContext();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputData = new FormData(e.target);
    const inputUrl = inputData.get('url');
    const {
      data: { msg }
    } = await axios({
      method: 'post',
      url: 'http://localhost:3000/search',
      data: {
        link: inputUrl,
      },
    });
    
    if (msg !== 'success') {
      return toast.error(msg);
    } else {
      return toast.success(msg);
    }
  }

  const autoPaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      console.log(clipboardText);
      if (new URL(clipboardText) && url === '') {
        var regExp =
        /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        
        if (clipboardText.match(regExp)) {
          setUrl(clipboardText);
          setVideoId(clipboardText.match(regExp)[1]);
        } else {
          setUrl('');
        }
      }
    } catch (error) {
      
    }
  }
  return (
    <section className="container">
        <h1>{type} converter</h1>
        <form action="" method="post" onSubmit={handleSubmit}>
            <input type="text" name="url" onClick={autoPaste} onChange={(e) => handleType(e)} placeholder="Paste YouTube link" value={url || ''}/>
            <button type="submit">
                convert {type}
            </button>
        </form>
    </section>
  )
}
export default Form;